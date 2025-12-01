import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

interface TaskStatsProps {
  total: number;
  pending: number;
  completed: number;
}

export function TaskStats({ total, pending, completed }: TaskStatsProps) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      role="region"
      aria-label="Estadísticas de tareas"
    >
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <ListTodo className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide">Total</span>
        </div>
        <p className="text-2xl font-bold text-foreground" aria-label={`${total} tareas en total`}>
          {total}
        </p>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 text-warning mb-1">
          <Circle className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide">Pendientes</span>
        </div>
        <p className="text-2xl font-bold text-foreground" aria-label={`${pending} tareas pendientes`}>
          {pending}
        </p>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 text-success mb-1">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide">Completadas</span>
        </div>
        <p className="text-2xl font-bold text-foreground" aria-label={`${completed} tareas completadas`}>
          {completed}
        </p>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 text-primary mb-1">
          <span className="text-xs font-medium uppercase tracking-wide">Progreso</span>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-foreground" aria-label={`${completionRate}% de progreso`}>
            {completionRate}%
          </p>
        </div>
        <div 
          className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Barra de progreso"
        >
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
