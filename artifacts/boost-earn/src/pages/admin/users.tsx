import { useState } from "react";
import { useGetAdminUsers, useAdjustUserBalance, useToggleUserSuspension } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, ShieldCheck, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminUsers() {
  const { data: users, refetch } = useGetAdminUsers();
  const { mutate: adjustBalance } = useAdjustUserBalance();
  const { mutate: toggleSuspension } = useToggleUserSuspension();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isAdd, setIsAdd] = useState(true);

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    adjustBalance(
      { userId: selectedUser.id, data: { amount: Number(amount), operation: isAdd ? 'add' : 'subtract' } },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: "Solde mis à jour" });
          refetch();
          setSelectedUser(null);
          setAmount("");
        }
      }
    );
  };

  const handleToggleSuspend = (userId: number) => {
    toggleSuspension({ userId }, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Statut de suspension modifié" });
        refetch();
      }
    });
  };

  return (
    <div className="space-y-4">
      {users?.map(user => (
        <div key={user.id} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{user.fullName}</h3>
              {user.isSuspended && <span className="bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded">Suspendu</span>}
            </div>
            <p className="text-sm text-muted-foreground">{user.phone} • Équipe: {user.teamCount}</p>
            <p className="font-mono text-success font-bold mt-1">{user.balance} CDF</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Dialog open={selectedUser?.id === user.id} onOpenChange={(open) => !open && setSelectedUser(null)}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" onClick={() => setSelectedUser(user)}>
                  Gérer Solde
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Solde - {selectedUser?.fullName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBalanceSubmit} className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button type="button" variant={isAdd ? "default" : "secondary"} className="flex-1" onClick={() => setIsAdd(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                    <Button type="button" variant={!isAdd ? "destructive" : "secondary"} className="flex-1" onClick={() => setIsAdd(false)}>
                      <Minus className="w-4 h-4 mr-1" /> Réduire
                    </Button>
                  </div>
                  <Input type="number" required placeholder="Montant" value={amount} onChange={e => setAmount(e.target.value)} />
                  <Button type="submit" className="w-full">Confirmer</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              variant={user.isSuspended ? "default" : "destructive"}
              onClick={() => handleToggleSuspend(user.id)}
            >
              {user.isSuspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
