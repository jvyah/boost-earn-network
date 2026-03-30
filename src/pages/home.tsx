import { useState } from "react";
import { useGetPlatformCounts, useGetTasks } from "@workspace/api-client-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const { data: counts, isLoading: isLoadingCounts } = useGetPlatformCounts();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks(
    { platform: selectedPlatform || undefined },
    { query: { enabled: !!selectedPlatform } }
  );

  const platforms = [
    { id: 'tiktok', name: 'TikTok', count: counts?.tiktok || 0, color: 'from-[#00f2fe]/20 to-transparent', border: 'border-[#00f2fe]/30' },
    { id: 'facebook', name: 'Facebook', count: counts?.facebook || 0, color: 'from-[#1877F2]/20 to-transparent', border: 'border-[#1877F2]/30' },
    { id: 'youtube', name: 'YouTube', count: counts?.youtube || 0, color: 'from-[#FF0000]/20 to-transparent', border: 'border-[#FF0000]/30' },
    { id: 'instagram', name: 'Instagram', count: counts?.instagram || 0, color: 'from-[#E1306C]/20 to-transparent', border: 'border-[#E1306C]/30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <h2 className="text-2xl font-display font-bold mb-2">Bienvenue sur Boost&Earn</h2>
        <p className="text-muted-foreground text-sm">Gagnez 250 CDF par tâche validée !</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 px-2">Plateformes disponibles</h3>
        <div className="grid grid-cols-2 gap-4">
          {isLoadingCounts ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)
          ) : (
            platforms.map((p, i) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`relative overflow-hidden text-left p-5 rounded-3xl border ${p.border} bg-card hover:bg-secondary transition-all active:scale-95 shadow-lg shadow-black/20`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-50`} />
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className="bg-background/50 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/5">
                    <PlatformIcon platform={p.id} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-display font-bold text-primary">{p.count}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {p.count > 0 ? "disponible(s)" : "aucun lien"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      <Sheet open={!!selectedPlatform} onOpenChange={(open) => !open && setSelectedPlatform(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] bg-background border-t border-white/10 px-0 pb-0">
          <SheetHeader className="px-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-xl">
                <PlatformIcon platform={selectedPlatform || ''} />
              </div>
              <SheetTitle className="text-2xl capitalize font-display">Tâches {selectedPlatform}</SheetTitle>
            </div>
            <SheetDescription>
              Effectuez les actions demandées et soumettez vos captures d'écran.
            </SheetDescription>
          </SheetHeader>
          
          <div className="overflow-y-auto h-[calc(100%-80px)] p-6 space-y-4 pb-20">
            {isLoadingTasks ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
            ) : tasks && tasks.length > 0 ? (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <PlatformIcon platform={selectedPlatform || ''} className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Aucune tâche disponible pour le moment.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
