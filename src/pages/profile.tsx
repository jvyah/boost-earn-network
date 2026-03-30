import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useCreateWithdrawal } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Wallet, Info, Phone as PhoneIcon, MessageCircle, Facebook } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Profile() {
  const { user, clearAuth } = useAuthStore();
  const { toast } = useToast();
  const { mutate: requestWithdrawal, isPending } = useCreateWithdrawal();

  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [operator, setOperator] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (numAmount < 6000) {
      toast({ title: "Erreur", description: "Le minimum de retrait est de 6000 CDF", variant: "destructive" });
      return;
    }
    if (numAmount > (user?.balance || 0)) {
      toast({ title: "Erreur", description: "Solde insuffisant", variant: "destructive" });
      return;
    }

    requestWithdrawal({
      data: { amount: numAmount, phone, name, operator }
    }, {
      onSuccess: () => {
        toast({ title: "Demande envoyée", description: "Traitement sous 24h à 72h" });
        setWithdrawOpen(false);
        setAmount(""); setPhone(""); setName(""); setOperator("");
      },
      onError: (err: any) => {
        toast({ title: "Erreur", description: err.message || "Échec de la demande", variant: "destructive" });
      }
    });
  };

  const contactSupport = () => {
    window.open(`https://wa.me/+243835836829?text=${encodeURIComponent("Bonjour, je viens de Boost & Earn. J'ai besoin d'assistance.")}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-24 bg-gradient-brand opacity-20" />
        
        <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background shadow-xl flex items-center justify-center text-3xl font-display font-bold text-primary z-10 mb-4 mt-4">
          {user?.fullName.charAt(0).toUpperCase()}
        </div>
        
        <h2 className="text-2xl font-bold">{user?.fullName}</h2>
        <p className="text-muted-foreground mb-6">{user?.phone}</p>
        
        <div className="w-full bg-secondary/50 rounded-2xl p-4 border border-white/5">
          <p className="text-sm text-muted-foreground mb-1">Solde Disponible</p>
          <p className="text-4xl font-display font-bold text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            {user?.balance} <span className="text-xl">CDF</span>
          </p>
        </div>
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-brand shadow-lg">
            <Wallet className="w-5 h-5 mr-2" />
            Demander un retrait
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-white/10 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Retrait de fonds</DialogTitle>
          </DialogHeader>
          
          <div className="bg-secondary/50 p-3 rounded-xl text-sm text-muted-foreground mb-4">
            <ul className="list-disc pl-4 space-y-1">
              <li>Minimum : <strong className="text-white">6000 CDF</strong></li>
              <li>Traitement : 24h à 72h</li>
              <li>Jours : Lundi au samedi</li>
            </ul>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <Input required type="number" placeholder="Montant (CDF)" value={amount} onChange={e => setAmount(e.target.value)} className="h-12 bg-background" />
            <Input required type="tel" placeholder="Numéro de réception" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 bg-background" />
            <Input required placeholder="Nom du compte" value={name} onChange={e => setName(e.target.value)} className="h-12 bg-background" />
            
            <Select required value={operator} onValueChange={setOperator}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue placeholder="Opérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airtel">Airtel Money</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="orange">Orange Money</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" disabled={isPending} className="w-full h-12 font-bold mt-2">
              {isPending ? "Envoi..." : "Confirmer le retrait"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/5">
        <button onClick={() => window.open('https://www.facebook.com/share/1ByZtVkaL8/', '_blank')} className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
          <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Facebook className="w-5 h-5" /></div>
          <div className="flex-1">
            <h4 className="font-semibold">Page Officielle</h4>
            <p className="text-xs text-muted-foreground">Suivez notre page Facebook</p>
          </div>
        </button>

        <button onClick={contactSupport} className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
          <div className="bg-green-500/20 p-2 rounded-lg text-green-500"><PhoneIcon className="w-5 h-5" /></div>
          <div className="flex-1">
            <h4 className="font-semibold">Service Client</h4>
            <p className="text-xs text-muted-foreground">Assistance WhatsApp</p>
          </div>
        </button>
        
        <a href="https://chat.whatsapp.com/HRXsAtR3e5J9lIHr6hErLa" target="_blank" rel="noreferrer" className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left block">
          <div className="bg-primary/20 p-2 rounded-lg text-primary"><MessageCircle className="w-5 h-5" /></div>
          <div className="flex-1">
            <h4 className="font-semibold">Groupe WhatsApp</h4>
            <p className="text-xs text-muted-foreground">Rejoignez la communauté</p>
          </div>
        </a>

        <div className="p-6">
          <div className="flex items-start gap-3 text-muted-foreground">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p><strong className="text-white">À propos de nous</strong><br/>Boost & Earn est une plateforme qui combine visibilité digitale et opportunités de revenus.</p>
              <p className="text-destructive font-semibold text-xs mt-4">⚠️ AVERTISSEMENT: 1 seul compte autorisé. Multi-comptes = bannissement définitif.</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={() => clearAuth()} variant="destructive" className="w-full h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20">
        <LogOut className="w-5 h-5 mr-2" />
        Déconnexion
      </Button>
    </div>
  );
}
