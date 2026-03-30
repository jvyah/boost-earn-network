import { useState } from "react";
import { useCreateTask } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminAddTask() {
  const { mutate: createTask, isPending } = useCreateTask();
  const { toast } = useToast();

  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("");
  const [taskName, setTaskName] = useState("");
  const [durationDays, setDurationDays] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask({
      data: { link, platform, taskName, durationDays: Number(durationDays) }
    }, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Tâche ajoutée manuellement" });
        setLink(""); setPlatform(""); setTaskName(""); setDurationDays("1");
      }
    });
  };

  return (
    <div className="glass-panel p-6 rounded-3xl max-w-lg mx-auto">
      <h3 className="font-bold text-xl mb-6">Ajout Manuel</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lien</label>
          <Input required type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Plateforme</label>
          <Select required value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir..." />
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
          <label className="text-sm font-medium">Nom de la tâche</label>
          <Input required value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Ex: Like & Comment" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Durée (Jours)</label>
          <Input required type="number" min="1" value={durationDays} onChange={e => setDurationDays(e.target.value)} />
        </div>

        <Button type="submit" disabled={isPending} className="w-full h-12 mt-4">
          {isPending ? "Ajout..." : "Créer la tâche"}
        </Button>
      </form>
    </div>
  );
}
