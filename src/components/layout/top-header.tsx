import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useGetNotifications } from "@workspace/api-client-react";
import { Link } from "wouter";

export function TopHeader() {
  const { user } = useAuthStore();
  const { data: notifications } = useGetNotifications();
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 py-3 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="Boost & Earn" 
            className="w-8 h-8 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h1 className="text-xl font-display font-bold text-gradient">
            Boost&Earn
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="bg-secondary/50 px-3 py-1.5 rounded-full border border-white/5">
              <span className="text-sm font-semibold text-success">{user.balance} CDF</span>
            </div>
          )}
          
          <Link href="/notifications" className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
