import { useState } from "react";
import { useGetAdminSubmissions, useApproveSubmission, useRejectSubmission } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminValidateTasks() {
  const { data: submissions, refetch } = useGetAdminSubmissions();
  const { mutate: approve } = useApproveSubmission();
  const { mutate: reject } = useRejectSubmission();
  const { toast } = useToast();
  
  const [rejectReason, setRejectReason] = useState("");
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);

  // Filter only pending submissions and group by user
  const pending = submissions?.filter(s => s.status === 'pending') || [];
  
  // Grouping logic (grouped by user to process all user's tasks at once visually)
  const groupedByUser = pending.reduce((acc, sub) => {
    if (!acc[sub.userId]) acc[sub.userId] = { userName: sub.userName, submissions: [] };
    acc[sub.userId].submissions.push(sub);
    return acc;
  }, {} as Record<number, { userName: string, submissions: any[] }>);

  const handleApprove = (id: number) => {
    approve({ submissionId: id }, {
      onSuccess: () => {
        toast({ title: "Approuvé", description: "+200 CDF crédités" });
        refetch();
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRejectId || !rejectReason) return;

    reject({ submissionId: activeRejectId, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast({ title: "Rejeté", variant: "destructive" });
        refetch();
        setActiveRejectId(null);
        setRejectReason("");
      }
    });
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByUser).map(([userId, group]) => (
        <div key={userId} className="glass-panel p-5 rounded-3xl border-primary/20">
          <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-2">
            Utilisateur: <span className="text-primary">{group.userName}</span>
          </h3>
          
          <div className="space-y-6">
            {group.submissions.map(sub => (
              <div key={sub.id} className="bg-secondary/40 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">{sub.taskName} <span className="text-xs text-muted-foreground ml-2">({sub.platform})</span></div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(sub.createdAt), { locale: fr })}</div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 snap-x">
                  {sub.imageUrls.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0 snap-center">
                      <img src={url} alt={`Proof ${idx}`} className="w-32 h-56 object-cover rounded-xl border border-white/10 hover:border-primary transition-colors" />
                    </a>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => handleApprove(sub.id)} className="flex-1 bg-success hover:bg-success/80 text-success-foreground">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approuver
                  </Button>
                  
                  <Dialog open={activeRejectId === sub.id} onOpenChange={(open) => !open && setActiveRejectId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1" onClick={() => setActiveRejectId(sub.id)}>
                        <XCircle className="w-4 h-4 mr-2" /> Rejeter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Raison du rejet</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleReject} className="space-y-4">
                        <Input required placeholder="Ex: Capture non lisible, action non effectuée" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                        <Button type="submit" variant="destructive" className="w-full">Confirmer le rejet</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {pending.length === 0 && (
        <div className="text-center text-muted-foreground py-10">Aucune tâche en attente.</div>
      )}
    </div>
  );
}
