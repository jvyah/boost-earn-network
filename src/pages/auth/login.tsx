import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Phone } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useLogin();
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { phone, password } }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: "Connexion réussie", description: "Bienvenue sur Boost & Earn" });
        setLocation(data.user.isAdmin ? "/admin" : "/home");
      },
      onError: (err: any) => {
        toast({ 
          title: "Erreur de connexion", 
          description: err.response?.data?.error || "Vérifiez vos identifiants",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="relative flex flex-col items-center pt-12 pb-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-10 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-32 h-32 rounded-full bg-primary/20 blur-2xl absolute top-10 left-1/2 -translate-x-1/2" />
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="Boost & Earn Logo" 
          className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="w-full glass-panel p-8 rounded-3xl relative z-10">
        <h2 className="text-3xl font-display font-bold text-center mb-2">Bienvenue</h2>
        <p className="text-center text-muted-foreground mb-8">Connectez-vous pour commencer à gagner</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl focus:ring-primary/50 text-base"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-14 bg-secondary/50 border-white/10 rounded-xl focus:ring-primary/50 text-base"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-brand shadow-[0_0_20px_rgba(29,78,216,0.3)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] transition-all"
          >
            {isPending ? "Connexion..." : "Se Connecter"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Vous n'avez pas de compte ?{" "}
          <Link href="/register" className="text-primary hover:text-primary-foreground font-semibold transition-colors">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
