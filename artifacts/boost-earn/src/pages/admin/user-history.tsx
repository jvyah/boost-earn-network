import { useState, useEffect } from "react";
import { useGetAdminSubmissions, useGetAdminUsers } from "@workspace/api-client-react";
import { ArrowLeft, CheckCircle, Clock, XCircle, Banknote, Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  userId: number;
  userName: string;
  onBack: () => void;
}

type Tab = "approved" | "pending" | "rejected" | "transactions";

export default function AdminUserHistory({ userId, userName, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("approved");
  const { data: allSubmissions, isLoading: loadingSubs } = useGetAdminSubmissions();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const userSubs = allSubmissions?.filter(s => s.userId === userId) || [];
  const approved = userSubs.filter(s => s.status === "approved");
  const pending = userSubs.filter(s => s.status === "pending");
  const rejected = userSubs.filter(s => s.status === "rejected");

  useEffect(() => {
    if (activeTab !== "transactions") return;
    setLoadingTx(true);
    const token = localStorage.getItem("boost_earn_token");
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    fetch(`${base}/api/admin/users/${userId}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setTransactions(data))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTx(false));
  }, [activeTab, userId]);

  const tabs = [
    { id: "approved" as Tab, label: "Approuvées", count: approved.length, color: "text-green-400", icon: CheckCircle },
    { id: "pending" as Tab, label: "En attente", count: pending.length, color: "text-yellow-400", icon: Clock },
    { id: "rejected" as Tab, label: "Rejetées", count: rejected.length, color: "text-red-400", icon: XCircle },
    { id: "transactions" as Tab, label: "Transactions", count: transactions.length, color: "text-blue-400", icon: Banknote },
  ];

  const renderSubmissions = (subs: typeof userSubs) => {
    if (!subs.length) return (
      <div className="text-center py-10 text-muted-foreground">Aucune soumission dans cette catégorie.</div>
    );
    return subs.map(sub => (
      <div key={sub.id} className="bg-secondary/40 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{sub.taskName || "Tâche supprimée"}</p>
            <p className="text-xs text-muted-foreground uppercase">{sub.platform}</p>
          </div>
          <StatusBadge status={sub.status} />
        </div>
        {sub.rejectionReason && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            <span className="font-semibold">Motif : </span>{sub.rejectionReason}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(sub.createdAt), { locale: fr, addSuffix: true })}
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {sub.imageUrls?.map((url: string, i: number) => (
            <img key={i} src={url} alt="Capture" className="w-20 h-28 object-cover rounded-xl border border-white/10 shrink-0" />
          ))}
        </div>
      </div>
    ));
  };

  const renderTransactions = () => {
    if (loadingTx) return Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />);
    if (!transactions.length) return (
      <div className="text-center py-10 text-muted-foreground">Aucune transaction trouvée.</div>
    );
    return transactions.map(tx => (
      <div key={`${tx.type}-${tx.id}`} className="bg-secondary/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${tx.type === "deposit" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>
            {tx.type === "deposit" ? <Landmark className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-sm">{tx.type === "deposit" ? "Dépôt" : "Retrait"}</p>
            <p className="text-xs text-muted-foreground">{tx.note} • {tx.platform}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(tx.createdAt), { locale: fr, addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="text-right">
          {tx.amount && <p className="font-bold text-sm">{tx.amount} CDF</p>}
          <StatusBadge status={tx.status} />
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Retour aux utilisateurs</span>
      </button>

      <div className="glass-panel p-4 rounded-2xl">
        <h3 className="font-bold text-lg">Historique de <span className="text-primary">{userName}</span></h3>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-green-400">{approved.length} approuvées</span>
          <span className="text-yellow-400">{pending.length} en attente</span>
          <span className="text-red-400">{rejected.length} rejetées</span>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 text-xs font-bold ${activeTab === tab.id ? "text-primary-foreground" : tab.color}`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loadingSubs ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : activeTab === "approved" ? renderSubmissions(approved)
          : activeTab === "pending" ? renderSubmissions(pending)
          : activeTab === "rejected" ? renderSubmissions(rejected)
          : renderTransactions()
        }
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    rejected: "bg-red-500/20 text-red-400",
    completed: "bg-green-500/20 text-green-400",
  };
  const labels: Record<string, string> = {
    approved: "Approuvé",
    pending: "En attente",
    rejected: "Rejeté",
    completed: "Complété",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-secondary text-muted-foreground"}`}>
      {labels[status] || status}
    </span>
  );
}
