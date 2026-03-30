import { useState } from "react";
import { Task } from "@workspace/api-client-react";
import { PlatformIcon } from "./ui/platform-icon";
import { ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { ImageUploader } from "./image-uploader";
import { useSubmitTaskProof } from "@/hooks/use-custom-uploads";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function TaskCard({ task }: { task: Task }) {
  const [images, setImages] = useState<File[]>([]);
  const { mutate: submitProof, isPending } = useSubmitTaskProof();
  const { toast } = useToast();

  const handleOpenLink = () => {
    // Use standard window.open for all platforms - let mobile OS handle deep linking to correct content
    window.open(task.link, '_blank');
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      toast({ title: "Erreur", description: "Veuillez ajouter au moins une capture d'écran", variant: "destructive" });
      return;
    }
    
    submitProof(
      { taskId: task.id, files: images },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: "Captures soumises avec succès. En attente de validation." });
          setImages([]);
        },
        onError: (err) => {
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const expiresDate = new Date(task.expiresAt);
  const isExpired = expiresDate < new Date();

  return (
    <div className="bg-card rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/20 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2.5 rounded-xl border border-white/5">
            <PlatformIcon platform={task.platform} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{task.taskName}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{task.platform}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-block bg-success/20 text-success text-xs font-bold px-2 py-1 rounded-md mb-1">
            +250 CDF
          </div>
          <div className="text-[10px] text-muted-foreground block">
            Reste: {formatDistanceToNow(expiresDate, { locale: fr })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleOpenLink} 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2 h-12 bg-white/5 hover:bg-white/10"
        >
          Ouvrir le lien
          <ExternalLink className="w-4 h-4" />
        </Button>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-200 flex gap-2 items-start">
          <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p>Assurez-vous d'avoir effectué toutes les actions avant soumission. Les captures doivent être complètes et non rognées.</p>
        </div>

        <ImageUploader maxImages={3} onImagesChange={setImages} />

        <Button 
          onClick={handleSubmit} 
          disabled={images.length === 0 || isPending || isExpired}
          className="w-full h-14 rounded-xl font-bold text-base bg-gradient-brand hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {isPending ? "Soumission..." : "Soumettre les captures"}
        </Button>
      </div>
    </div>
  );
}
