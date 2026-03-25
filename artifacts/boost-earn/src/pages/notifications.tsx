import { useGetNotifications } from "@workspace/api-client-react";
import { Bell, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Notifications() {
  const { data: notifications, isLoading } = useGetNotifications();

  const getStatusColor = (message: string) => {
    if (message.includes("validée") || message.includes("Félicitations")) {
      return { bg: "bg-success/10", border: "border-success/30", text: "text-success", icon: CheckCircle };
    }
    if (message.includes("attente") || message.includes("En attente")) {
      return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500", icon: AlertCircle };
    }
    if (message.includes("rejeté") || message.includes("Rejeté")) {
      return { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", icon: XCircle };
    }
    return { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", icon: Bell };
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <h2 className="text-2xl font-display font-bold mb-2">Notifications</h2>
        <p className="text-muted-foreground text-sm">Suivi de vos tâches et messages</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : notifications && notifications.length > 0 ? (
          notifications.map(notif => {
            const { bg, border, text, icon: IconComponent } = getStatusColor(notif.message);
            return (
              <div key={notif.id} className={`${bg} border ${border} rounded-2xl p-4 flex gap-4 items-start`}>
                <div className={`${text} mt-1 flex-shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${text} text-sm font-semibold mb-1`}>{notif.type === "success" ? "Succès" : notif.type === "warning" ? "Attention" : "Info"}</p>
                  <p className="text-sm text-foreground/90">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notif.createdAt), { locale: fr, addSuffix: true })}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucune notification pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
