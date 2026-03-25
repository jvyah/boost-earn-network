import { useState } from "react";
import { useGetDeposits, useApproveDeposit } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminDeposits() {
  const { data: deposits, refetch } = useGetDeposits();
  const { mutate: approve } = useApproveDeposit();
  const { toast } = useToast();

  const [activeDep, setActiveDep] = useState<any>(null);
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");

  const pending = deposits?.filter(d => d.status === 'pending') || [];

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDep || !taskName || !duration) return;

    approve({ depositId: activeDep.id, data: { taskName, durationDays: Number(duration) } }, {
      onSuccess: () => {
        toast({ title: "Publié", description: "Tâche créée et publiée" });
        refetch();
        setActiveDep(null);
      }
    });
  };

  const openApprove = (dep: any) => {
    setActiveDep(dep);
    setTaskName(`Tâche ${dep.platform} - ${dep.taskType}`);
    setDuration(dep.durationDays.toString());
  };

  return (
    <div className="space-y-4">
      {pending.map(dep => (
        <div key={dep.id} className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4">
          <a href={dep.paymentProofUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <img src={dep.paymentProofUrl} alt="Proof" className="w-24 h-32 object-cover rounded-xl border border-white/10" />
          </a>
          <div className="flex-1">
            <h3 className="font-bold">{dep.userName}</h3>
            <p className="text-sm text-muted-foreground mb-2 break-all">{dep.link}</p>
            <div className="flex gap-2 text-xs font-semibold mb-3">
              <span className="bg-secondary px-2 py-1 rounded">{dep.platform}</span>
              <span className="bg-secondary px-2 py-1 rounded">{dep.taskType}</span>
              <span className="bg-secondary px-2 py-1 rounded">{dep.durationDays} Jours</span>
            </div>
            <Button onClick={() => openApprove(dep)} className="w-full md:w-auto">Valider et Publier</Button>
          </div>
        </div>
      ))}

      {pending.length === 0 && <div className="text-center py-10 text-muted-foreground">Aucun dépôt en attente.</div>}

      <Dialog open={!!activeDep} onOpenChange={(open) => !open && setActiveDep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier la tâche</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApprove} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom de la tâche</label>
              <Input required value={taskName} onChange={e => setTaskName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Durée (Jours)</label>
              <Input required type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Publier</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
