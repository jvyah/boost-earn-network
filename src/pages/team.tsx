import { useState } from "react";
import { useGetReferralLink, useGetTeam } from "@workspace/api-client-react";
import { Users, Copy, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Team() {
  const { data: refInfo, isLoading: loadingRef } = useGetReferralLink();
  const { data: team, isLoading: loadingTeam } = useGetTeam();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (refInfo?.referralLink) {
      navigator.clipboard.writeText(refInfo.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-accent/20 to-transparent border-accent/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent/20 p-2.5 rounded-xl text-accent">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold">Mon Équipe</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Invitez vos amis et gagnez des commissions sur leurs tâches validées !
        </p>

        {loadingRef ? (
          <Skeleton className="h-14 rounded-xl" />
        ) : refInfo && (
          <div className="bg-secondary p-2 pl-4 rounded-xl flex items-center justify-between border border-white/5">
            <div className="truncate pr-4 text-sm font-mono text-primary/80">
              {refInfo.referralLink}
            </div>
            <Button onClick={handleCopy} className="rounded-lg shrink-0">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-bold text-lg">Membres ({refInfo?.totalReferrals || 0})</h3>
          <div className="flex items-center gap-1 text-success text-sm font-medium">
            <TrendingUp className="w-4 h-4" /> Actifs
          </div>
        </div>

        <div className="space-y-3">
          {loadingTeam ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : team && team.length > 0 ? (
            team.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/30">
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">Inscrit {formatDistanceToNow(new Date(member.createdAt), { locale: fr, addSuffix: true })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{member.balance} CDF</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Vous n'avez pas encore invité d'amis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
