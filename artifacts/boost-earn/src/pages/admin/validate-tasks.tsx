import { useState } from "react";
import { useGetAdminSubmissions, useApproveSubmission, useRejectSubmission } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ZoomIn, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const REJECTION_REASONS = [
  'Capture non conforme (floue ou rognée)',
  'Action incomplète (Like ou Follow manquant)',
  'Preuve déjà utilisée par un autre compte',
  'Compte social ne correspond pas au profil',
  'Paiement non reçu (Vérifiez votre ID de transaction)',
];

export default function AdminValidateTasks() {
  const { data: submissions, refetch } = useGetAdminSubmissions();
  const { mutate: approve } = useApproveSubmission();
  const { mutate: reject } = useRejectSubmission();
  const { toast } = useToast();
  
  const [rejectReason, setRejectReason] = useState("");
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Filter only pending submissions and group by user
  const pending = submissions?.filter(s => s.status === 'pending') || [];
  
  // Grouping logic (grouped by user to process all user's tasks at once visually)
  const groupedByUser = pending.reduce((acc, sub) => {
    if (!acc[sub.userId]) acc[sub.userId] = { userName: sub.userName, submissions: [] };
    acc[sub.userId].submissions.push(sub);
    return acc;
  }, {} as Record<number, { userName: string, submissions: any[] }>);

  const handleApprove = (id: number) => {
    approve({ submissionId: id }, {
      onSuccess: () => {
        toast({ title: "✅ Approuvé", description: "+250 CDF crédités à l'utilisateur" });
        refetch();
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRejectId || !rejectReason) return;

    reject({ submissionId: activeRejectId, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast({ title: "Rejeté", variant: "destructive" });
        refetch();
        setActiveRejectId(null);
        setRejectReason("");
      }
    });
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByUser).map(([userId, group]) => (
        <div key={userId} className="glass-panel p-5 rounded-3xl border-primary/20">
          <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-2">
            Utilisateur: <span className="text-primary">{group.userName}</span>
          </h3>
          
          <div className="space-y-6">
            {group.submissions.map(sub => (
              <div key={sub.id} className="bg-secondary/40 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">{sub.taskName} <span className="text-xs text-muted-foreground ml-2">({sub.platform})</span></div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(sub.createdAt), { locale: fr })}</div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 snap-x">
                  {sub.imageUrls.map((url: string, idx: number) => (
                    <button key={idx} onClick={() => setZoomedImage(url)} className="shrink-0 snap-center hover:opacity-80 transition">
                      <div className="relative">
                        <img src={url} alt={`Proof ${idx}`} className="w-32 h-56 object-cover rounded-xl border border-white/10" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 rounded-xl transition">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => handleApprove(sub.id)} className="flex-1 bg-success hover:bg-success/80 text-success-foreground">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approuver
                  </Button>
                  
                  <Dialog open={activeRejectId === sub.id} onOpenChange={(open) => !open && setActiveRejectId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1" onClick={() => setActiveRejectId(sub.id)}>
                        <XCircle className="w-4 h-4 mr-2" /> Rejeter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Motif du rejet</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleReject} className="space-y-4">
                        <Select required value={rejectReason} onValueChange={setRejectReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un motif..." />
                          </SelectTrigger>
                          <SelectContent>
                            {REJECTION_REASONS.map(reason => (
                              <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="submit" variant="destructive" className="w-full">Confirmer le rejet</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {pending.length === 0 && (
        <div className="text-center text-muted-foreground py-10">Aucune tâche en attente.</div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomedImage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <XIcon className="w-6 h-6" />
            </button>
            <img src={zoomedImage} alt="Zoomed" className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
