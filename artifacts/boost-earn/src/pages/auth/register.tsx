import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Phone, User, Users } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const { mutate: register, isPending } = useRegister();
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ 
      data: { fullName, phone, password, referralCode: referralCode || undefined } 
    }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: "Inscription réussie", description: "Bienvenue sur Boost & Earn" });
        setLocation("/home");
      },
      onError: (err: any) => {
        toast({ 
          title: "Erreur d'inscription", 
          description: err.response?.data?.error || "Vérifiez vos informations",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="relative flex flex-col items-center pt-8 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <div className="mb-6">
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="Boost & Earn Logo" 
          className="w-24 h-24 object-contain drop-shadow-2xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="w-full glass-panel p-8 rounded-3xl">
        <h2 className="text-3xl font-display font-bold text-center mb-2">Créer un compte</h2>
        <p className="text-center text-muted-foreground mb-8">Rejoignez-nous et commencez à gagner</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Code de parrainage (optionnel)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 mt-4 text-lg font-bold rounded-xl bg-gradient-brand shadow-lg transition-all"
          >
            {isPending ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:text-primary-foreground font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
