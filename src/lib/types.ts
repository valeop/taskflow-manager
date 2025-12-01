export type Priority = 'alta' | 'media' | 'baja';
export type TaskStatus = 'pendiente' | 'completada';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  dueDate: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | undefined;
}

export type FilterType = 'todas' | 'pendientes' | 'completadas';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
