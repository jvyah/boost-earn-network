import { useState } from "react";
import { useGetNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Bell, CheckCircle, AlertCircle, XCircle, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = useGetNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getStatusStyle = (type: string, message: string) => {
    if (type === "success" || message.includes("validée") || message.includes("Félicitations")) {
      return { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", label: "Succès", icon: CheckCircle };
    }
    if (message.includes("rejeté") || message.includes("Rejeté") || type === "error") {
      return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "Rejeté", icon: XCircle };
    }
    if (message.includes("attente") || type === "warning") {
      return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", label: "En attente", icon: AlertCircle };
    }
    return { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", label: "Bienvenue", icon: CheckCircle };
  };

  const handleMarkAllRead = () => {
    markAllRead(undefined, {
      onSuccess: () => {
        toast({ title: "Lu", description: "Toutes les notifications sont marquées comme lues" });
        refetch();
      }
    });
  };

  const handleDeleteAll = async () => {
    const token = localStorage.getItem("boost_earn_token");
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/notifications/all`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: "Supprimé", description: "Toutes les notifications ont été supprimées" });
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const handleDeleteOne = async (id: number) => {
    const token = localStorage.getItem("boost_earn_token");
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const unread = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-500">
      <div className="glass-panel p-5 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold mb-1">Notifications</h2>
            <p className="text-muted-foreground text-sm">{unread > 0 ? `${unread} non lue(s)` : "Tout est à jour"}</p>
          </div>
          <Bell className="w-8 h-8 text-primary/50" />
        </div>
      </div>

      {notifications && notifications.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleMarkAllRead}
          >
            <Check className="w-4 h-4" />
            Tout lire
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleDeleteAll}
          >
            <Trash2 className="w-4 h-4" />
            Tout supprimer
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : notifications && notifications.length > 0 ? (
          [...notifications].reverse().map(notif => {
            const { bg, border, text, label, icon: IconComponent } = getStatusStyle(notif.type, notif.message);
            return (
              <div key={notif.id} className={`${bg} border ${border} rounded-2xl p-4 flex gap-3 items-start`}>
                <div className={`${text} mt-0.5 flex-shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${text} text-xs font-bold uppercase tracking-wider`}>{label}</span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {formatDistanceToNow(new Date(notif.createdAt), { locale: fr, addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteOne(notif.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Aucune notification</p>
            <p className="text-sm mt-1 opacity-60">Vous serez notifié ici après validation de vos tâches.</p>
          </div>
        )}
      </div>
    </div>
  );
}
