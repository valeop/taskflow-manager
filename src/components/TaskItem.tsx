import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Trash2, 
  Edit3, 
  Calendar, 
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  isDeleting?: boolean;
  isToggling?: boolean;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  alta: { label: 'Alta', className: 'priority-alta' },
  media: { label: 'Media', className: 'priority-media' },
  baja: { label: 'Baja', className: 'priority-baja' },
};

export function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit,
  isDeleting = false,
  isToggling = false 
}: TaskItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isCompleted = task.status === 'completada';
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !isCompleted;
  const isDueToday = dueDate && isToday(dueDate);

  const handleDelete = async () => {
    await onDelete(task.taskId);
    setDeleteDialogOpen(false);
  };

  const formatDueDate = () => {
    if (!dueDate) return null;
    
    if (isToday(dueDate)) {
      return 'Hoy';
    }
    
    return format(dueDate, "d 'de' MMM", { locale: es });
  };

  return (
    <Card 
      className={cn(
        'task-card animate-task-enter',
        isCompleted && 'task-completed'
      )}
      role="article"
      aria-label={`Tarea: ${task.title}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              id={`task-${task.taskId}`}
              checked={isCompleted}
              onCheckedChange={() => onToggle(task.taskId)}
              disabled={isToggling}
              aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
              className="touch-target h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 
                  className={cn(
                    'task-title font-medium text-foreground leading-tight',
                    isCompleted && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge 
                    className={cn(
                      'text-xs font-medium',
                      priorityConfig[task.priority].className
                    )}
                    aria-label={`Prioridad: ${priorityConfig[task.priority].label}`}
                  >
                    {priorityConfig[task.priority].label}
                  </Badge>

                  {dueDate && (
                    <span 
                      className={cn(
                        'inline-flex items-center gap-1 text-xs',
                        isOverdue && 'text-destructive font-medium',
                        isDueToday && !isCompleted && 'text-warning font-medium',
                        !isOverdue && !isDueToday && 'text-muted-foreground'
                      )}
                      aria-label={`Fecha límite: ${format(dueDate, "PPP", { locale: es })}`}
                    >
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatDueDate()}
                      {isOverdue && (
                        <AlertTriangle className="h-3 w-3 ml-1" aria-hidden="true" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {isToggling && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(task)}
                      aria-label={`Editar tarea: ${task.title}`}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>

                {!isCompleted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-success"
                        onClick={() => onToggle(task.taskId)}
                        disabled={isToggling}
                        aria-label={`Completar tarea: ${task.title}`}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Completar</TooltipContent>
                  </Tooltip>
                )}

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Eliminar tarea: ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar</TooltipContent>
                  </Tooltip>
                  
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La tarea "{task.title}" será eliminada permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
