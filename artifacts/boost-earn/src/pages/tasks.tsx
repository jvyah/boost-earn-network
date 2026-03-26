import { useState } from "react";
import { useGetTasks, useGetSubmissions } from "@workspace/api-client-react";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo, History, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";

type View = "tasks" | "history";

const statusStyle: Record<string, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  approved: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: CheckCircle },
  pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", icon: Clock },
  rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: XCircle },
};

const statusLabel: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente de validation",
  rejected: "Rejeté",
};

export default function Tasks() {
  const [view, setView] = useState<View>("tasks");
  const { data: tasks, isLoading: loadingTasks } = useGetTasks();
  const { data: submissions, isLoading: loadingHistory } = useGetSubmissions();

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="bg-primary/20 p-3 rounded-2xl text-primary">
          <ListTodo className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Mes Tâches</h2>
          <p className="text-sm text-muted-foreground">Complétez pour gagner 200 CDF</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl">
        <button
          onClick={() => setView("tasks")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            view === "tasks" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Disponibles {tasks ? `(${tasks.length})` : ""}
        </button>
        <button
          onClick={() => setView("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            view === "history" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          Historique {submissions ? `(${submissions.length})` : ""}
        </button>
      </div>

      {view === "tasks" ? (
        <div className="space-y-4">
          {loadingTasks ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
          ) : tasks && tasks.length > 0 ? (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="glass-panel p-10 text-center rounded-3xl">
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucune tâche disponible</h3>
              <p className="text-muted-foreground text-sm">Revenez plus tard pour de nouvelles opportunités.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {loadingHistory ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : submissions && submissions.length > 0 ? (
            [...submissions].reverse().map(sub => {
              const style = statusStyle[sub.status] || statusStyle["pending"];
              const Icon = style.icon;
              return (
                <div key={sub.id} className={`${style.bg} border ${style.border} rounded-2xl p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-background/50 p-2 rounded-xl">
                        <PlatformIcon platform={(sub as any).platform || ""} className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{(sub as any).taskName || "Tâche"}</p>
                        <p className="text-xs text-muted-foreground uppercase">{(sub as any).platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${style.text}`} />
                      <span className={`text-xs font-bold ${style.text}`}>{statusLabel[sub.status]}</span>
                    </div>
                  </div>

                  {sub.status === "approved" && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <p className="text-xs text-green-400 font-semibold">+200 CDF crédités à votre solde</p>
                    </div>
                  )}
                  {sub.status === "rejected" && (sub as any).rejectionReason && (
                    <p className="text-xs text-red-400 mt-1.5 bg-red-500/10 rounded-lg px-3 py-1.5">
                      <span className="font-semibold">Motif : </span>{(sub as any).rejectionReason}
                    </p>
                  )}
                  {sub.status === "pending" && (
                    <p className="text-xs text-yellow-400/80 mt-1">Votre soumission est en cours de révision par l'équipe.</p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    Soumis {formatDistanceToNow(new Date(sub.createdAt), { locale: fr, addSuffix: true })}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-10 text-center rounded-3xl">
              <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
              <p className="text-muted-foreground text-sm">Vos soumissions apparaîtront ici après envoi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
