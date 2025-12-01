import { Task } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  isLoading?: boolean;
  deletingId?: string | null;
  togglingId?: string | null;
}

function TaskSkeleton() {
  return (
    <Card className="task-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
      aria-label="No hay tareas"
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        No hay tareas
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Comienza agregando una nueva tarea usando el formulario de arriba.
      </p>
    </div>
  );
}

export function TaskList({ 
  tasks, 
  onToggle, 
  onDelete, 
  onEdit,
  isLoading = false,
  deletingId = null,
  togglingId = null
}: TaskListProps) {
  if (isLoading) {
    return (
      <div 
        className="space-y-3" 
        role="status" 
        aria-label="Cargando tareas"
        aria-busy="true"
      >
        <span className="sr-only">Cargando tareas...</span>
        {[1, 2, 3].map((i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <section 
      aria-label="Lista de tareas"
      className="space-y-3"
    >
      <div 
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
        className="space-y-3"
      >
        {tasks.map((task, index) => (
          <div 
            key={task.taskId} 
            role="listitem"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskItem
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isDeleting={deletingId === task.taskId}
              isToggling={togglingId === task.taskId}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
