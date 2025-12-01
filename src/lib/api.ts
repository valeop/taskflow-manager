import { Task, TaskFormData } from './types';

const API_BASE_URL = '[URL_PLACEHOLDER]';

// Simulated delay for demo purposes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key
const STORAGE_KEY = 'taskmaster_tasks';

// Helper to get tasks from localStorage
const getStoredTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save tasks to localStorage
const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// Generate unique ID
const generateId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// API Service - Currently uses localStorage, ready for API integration
export const taskApi = {
  // GET all tasks
  async getTasks(): Promise<Task[]> {
    await delay(300); // Simulate network delay
    
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/tasks`);
    // return response.json();
    
    return getStoredTasks();
  },

  // POST create task
  async createTask(formData: TaskFormData): Promise<Task> {
    await delay(400);
    
    const newTask: Task = {
      taskId: generateId(),
      title: formData.title,
      description: formData.description || '',
      priority: formData.priority,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      dueDate: formData.dueDate?.toISOString() || '',
    };

    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/tasks`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newTask),
    // });
    // return response.json();

    const tasks = getStoredTasks();
    tasks.unshift(newTask);
    saveTasks(tasks);
    
    return newTask;
  },

  // PUT update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await delay(300);

    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // });
    // return response.json();

    const tasks = getStoredTasks();
    const index = tasks.findIndex(t => t.taskId === taskId);
    
    if (index === -1) {
      throw new Error('Tarea no encontrada');
    }

    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(tasks);
    
    return tasks[index];
  },

  // DELETE task
  async deleteTask(taskId: string): Promise<void> {
    await delay(300);

    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    //   method: 'DELETE',
    // });

    const tasks = getStoredTasks();
    const filtered = tasks.filter(t => t.taskId !== taskId);
    saveTasks(filtered);
  },

  // Toggle task completion
  async toggleTaskStatus(taskId: string): Promise<Task> {
    const tasks = getStoredTasks();
    const task = tasks.find(t => t.taskId === taskId);
    
    if (!task) {
      throw new Error('Tarea no encontrada');
    }

    const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
    return this.updateTask(taskId, { status: newStatus });
  },
};
