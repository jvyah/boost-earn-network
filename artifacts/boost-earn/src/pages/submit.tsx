import { useState } from "react";
import { Copy, Check, Upload as UploadIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSubmitDeposit } from "@/hooks/use-custom-uploads";

export default function Submit() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("");
  const [taskType, setTaskType] = useState("");
  const [duration, setDuration] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  
  const { mutate: submitDeposit, isPending } = useSubmitDeposit();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: "Copié", description: `Numéro copié dans le presse-papier.` });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProof(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) {
      toast({ title: "Erreur", description: "Veuillez uploader la preuve de paiement", variant: "destructive" });
      return;
    }

    submitDeposit({
      link, platform, taskType, durationDays: parseInt(duration), proof
    }, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Votre demande a été soumise avec succès." });
        setLink(""); setPlatform(""); setTaskType(""); setDuration(""); setProof(null);
      }
    });
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-primary w-5 h-5" />
          Dépôt & Boost
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Achetez de la visibilité réelle pour vos réseaux sociaux. Payez sur l'un des numéros ci-dessous, puis soumettez votre lien.
        </p>

        <div className="space-y-3">
          {[
            { name: "Airtel Money", number: "0980687851", color: "bg-red-500/10 text-red-400 border-red-500/20" },
            { name: "M-Pesa", number: "0835836829", color: "bg-green-500/10 text-green-400 border-green-500/20" },
            { name: "Orange Money", number: "0845691564", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" }
          ].map(p => (
            <div key={p.name} className={`flex items-center justify-between p-3 rounded-xl border ${p.color}`}>
              <div>
                <p className="text-xs uppercase font-bold opacity-80">{p.name}</p>
                <p className="font-mono text-lg font-medium">{p.number}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleCopy(p.number, p.name)} className="hover:bg-white/10">
                {copied === p.name ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          ))}
          <div className="text-center text-sm pt-2 font-medium opacity-80">Nom du compte : Jonas Mbusa</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="font-bold text-lg mb-6">Soumettre votre lien</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Lien de la publication/profil</label>
            <Input required value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="bg-secondary h-12 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Plateforme</label>
              <Select required value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-secondary h-12 rounded-xl border-white/10">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Durée (Tarif)</label>
              <Select required value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-secondary h-12 rounded-xl border-white/10">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 jour (10 000 CDF)</SelectItem>
                  <SelectItem value="3">3 jours (20 000 CDF)</SelectItem>
                  <SelectItem value="7">7 jours (40 000 CDF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Type de tâche</label>
            <Select required value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="bg-secondary h-12 rounded-xl border-white/10">
                <SelectValue placeholder="Ex: Like + Comment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="like_comment_sub">Aimer + Commenter + S’abonner</SelectItem>
                <SelectItem value="like_comment">Aimer + Commenter</SelectItem>
                <SelectItem value="like_sub">Aimer + S’abonner</SelectItem>
                <SelectItem value="comment_sub">Commenter + S’abonner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Preuve de paiement</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                required 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-dashed transition-colors ${proof ? 'bg-success/10 border-success/30 text-success' : 'bg-secondary border-border text-muted-foreground'}`}>
                {proof ? (
                  <><Check className="w-5 h-5" /> {proof.name}</>
                ) : (
                  <><UploadIcon className="w-5 h-5" /> Ajouter la capture</>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-brand mt-4">
            {isPending ? "Envoi..." : "Soumettre la demande"}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground mt-4">
            Si vous souhaitez une durée personnalisée, contactez le service client.
          </p>
        </form>
      </div>
    </div>
  );
}
