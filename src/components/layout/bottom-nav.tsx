import { Link, useRoute } from "wouter";
import { Home, ListTodo, Upload, Users, User, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin;

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const [isActive] = useRoute(href);
    
    return (
      <Link href={href} className="flex-1">
        <div className={cn(
          "flex flex-col items-center justify-center py-3 space-y-1 transition-all duration-300",
          isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-white hover:scale-105"
        )}>
          <div className={cn(
            "p-1.5 rounded-xl transition-colors",
            isActive && "bg-primary/20 shadow-[0_0_15px_rgba(29,78,216,0.3)]"
          )}>
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/5 rounded-t-2xl pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto px-2">
        <NavItem href="/home" icon={Home} label="Accueil" />
        <NavItem href="/tasks" icon={ListTodo} label="Tâches" />
        <NavItem href="/submit" icon={Upload} label="Soumettre" />
        <NavItem href="/team" icon={Users} label="Équipe" />
        {isAdmin ? (
          <NavItem href="/admin" icon={ShieldCheck} label="Admin" />
        ) : (
          <NavItem href="/profile" icon={User} label="Profil" />
        )}
      </div>
    </div>
  );
}
