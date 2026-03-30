import { useState } from "react";
import { useGetAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminWithdrawals() {
  const { data: withdrawals, refetch } = useGetAdminWithdrawals();
  const { mutate: approve } = useApproveWithdrawal();
  const { mutate: reject } = useRejectWithdrawal();
  const { toast } = useToast();

  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = withdrawals?.filter(w => w.status === 'pending') || [];

  const handleApprove = (id: number) => {
    approve({ withdrawalId: id }, {
      onSuccess: () => {
        toast({ title: "Retrait approuvé" });
        refetch();
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRejectId || !rejectReason) return;

    reject({ withdrawalId: activeRejectId, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast({ title: "Retrait rejeté et remboursé", variant: "destructive" });
        refetch();
        setActiveRejectId(null);
        setRejectReason("");
      }
    });
  };

  return (
    <div className="space-y-4">
      {pending.map(w => (
        <div key={w.id} className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h3 className="font-bold text-lg">{w.amount} CDF</h3>
            <p className="text-sm font-semibold text-primary">{w.operator.toUpperCase()} - {w.phone}</p>
            <p className="text-xs text-muted-foreground">{w.name} ({w.userName})</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={() => handleApprove(w.id)} className="flex-1 bg-success hover:bg-success/80">Approuver</Button>
            
            <Dialog open={activeRejectId === w.id} onOpenChange={(open) => !open && setActiveRejectId(null)}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1" onClick={() => setActiveRejectId(w.id)}>Rejeter</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Rejeter le retrait</DialogTitle></DialogHeader>
                <form onSubmit={handleReject} className="space-y-4">
                  <Input required placeholder="Raison (ex: Numéro invalide)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                  <Button type="submit" variant="destructive" className="w-full">Confirmer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
      
      {pending.length === 0 && <div className="text-center py-10 text-muted-foreground">Aucun retrait en attente.</div>}
    </div>
  );
}
