import { useGetTasks } from "@workspace/api-client-react";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo } from "lucide-react";

export default function Tasks() {
  const { data: tasks, isLoading } = useGetTasks();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-primary/20 p-3 rounded-2xl text-primary">
          <ListTodo className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Toutes les tâches</h2>
          <p className="text-sm text-muted-foreground">Complétez pour gagner</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
        ) : tasks && tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="glass-panel p-10 text-center rounded-3xl">
            <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune tâche active</h3>
            <p className="text-muted-foreground text-sm">Revenez plus tard pour de nouvelles opportunités.</p>
          </div>
        )}
      </div>
    </div>
  );
}
