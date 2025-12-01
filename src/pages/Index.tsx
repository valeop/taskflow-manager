import { useState, useEffect, useMemo, useCallback } from 'react';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskFilters } from '@/components/TaskFilters';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TaskStats } from '@/components/TaskStats';
import { Task, FilterType, TaskFormData } from '@/lib/types';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await taskApi.getTasks();
        setTasks(loadedTasks);
      } catch (error) {
        toast({
          title: 'Error al cargar tareas',
          description: 'No se pudieron cargar las tareas. Intenta de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [toast]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'pendientes':
        return tasks.filter(t => t.status === 'pendiente');
      case 'completadas':
        return tasks.filter(t => t.status === 'completada');
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Task counts
  const counts = useMemo(() => ({
    todas: tasks.length,
    pendientes: tasks.filter(t => t.status === 'pendiente').length,
    completadas: tasks.filter(t => t.status === 'completada').length,
  }), [tasks]);

  // Create task
  const handleCreateTask = useCallback(async (formData: TaskFormData) => {
    setIsCreating(true);
    try {
      const newTask = await taskApi.createTask(formData);
      setTasks(prev => [newTask, ...prev]);
      toast({
        title: 'Tarea creada',
        description: `"${newTask.title}" ha sido agregada correctamente.`,
      });
    } catch (error) {
      toast({
        title: 'Error al crear tarea',
        description: 'No se pudo crear la tarea. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  // Toggle task status
  const handleToggleTask = useCallback(async (taskId: string) => {
    setTogglingId(taskId);
    try {
      const updatedTask = await taskApi.toggleTaskStatus(taskId);
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      
      const action = updatedTask.status === 'completada' ? 'completada' : 'marcada como pendiente';
      toast({
        title: `Tarea ${action}`,
        description: `"${updatedTask.title}" ha sido ${action}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la tarea.',
        variant: 'destructive',
      });
    } finally {
      setTogglingId(null);
    }
  }, [toast]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId: string) => {
    setDeletingId(taskId);
    const taskToDelete = tasks.find(t => t.taskId === taskId);
    
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      toast({
        title: 'Tarea eliminada',
        description: taskToDelete ? `"${taskToDelete.title}" ha sido eliminada.` : 'La tarea ha sido eliminada.',
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la tarea.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }, [tasks, toast]);

  // Edit task
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  // Save edited task
  const handleSaveEdit = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setIsEditing(true);
    try {
      const updatedTask = await taskApi.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      toast({
        title: 'Tarea actualizada',
        description: `"${updatedTask.title}" ha sido actualizada correctamente.`,
      });
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la tarea.',
        variant: 'destructive',
      });
    } finally {
      setIsEditing(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckSquare className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                TaskMaster
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Organiza y gestiona tus tareas eficientemente
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Stats */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Resumen de tareas</h2>
            <TaskStats
              total={counts.todas}
              pending={counts.pendientes}
              completed={counts.completadas}
            />
          </section>

          {/* Task form */}
          <section aria-labelledby="form-heading">
            <h2 id="form-heading" className="sr-only">Crear nueva tarea</h2>
            <TaskForm onSubmit={handleCreateTask} isLoading={isCreating} />
          </section>

          {/* Filters and list */}
          <section aria-labelledby="tasks-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="tasks-heading" className="text-lg font-semibold text-foreground">
                Mis Tareas
              </h2>
            </div>
            
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />

            <TaskList
              tasks={filteredTasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              isLoading={isLoading}
              deletingId={deletingId}
              togglingId={togglingId}
            />
          </section>
        </div>
      </main>

      {/* Edit dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={handleSaveEdit}
        isLoading={isEditing}
      />

      {/* Live region for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {counts.pendientes} tareas pendientes de {counts.todas} en total
      </div>
    </div>
  );
};

export default Index;
