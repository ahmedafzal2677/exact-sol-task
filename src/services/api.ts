import axios from 'axios';
import { LoginCredentials, User } from '../types/Auth';
import { Task } from '../types/Task';
import { jwtService } from './jwtService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const staticUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'anc@xyz.com',
    password: 'abc123',
    role: 'admin' as const
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@xyz.com',
    password: 'john123',
    role: 'user' as const
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@xyz.com',
    password: 'jane123',
    role: 'user' as const
  }
];

const staticTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the new feature implementation',
    status: 'in-progress',
    dueDate: '2024-03-30',
    priority: 'high',
    userId: '1'
  },
  {
    id: '2',
    title: 'Code Review',
    description: 'Review pull requests for the new authentication system',
    status: 'todo',
    dueDate: '2024-03-28',
    priority: 'medium',
    userId: '1'
  },
  {
    id: '3',
    title: 'Client Meeting',
    description: 'Weekly sync with the client team',
    status: 'completed',
    dueDate: '2024-03-25',
    priority: 'high',
    userId: '2'
  },
  {
    id: '4',
    title: 'Design Review',
    description: 'Review new UI designs for the dashboard',
    status: 'in-progress',
    dueDate: '2024-03-29',
    priority: 'medium',
    userId: '3'
  }
];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = jwtService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      jwtService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const user = staticUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token: jwtService.getToken() || ''
      };
    }
    throw new Error('Invalid credentials');
  },

  async getTasks(): Promise<Task[]> {
    const token = jwtService.getToken();
    if (!token) throw new Error('Not authenticated');

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    if (payload.role === 'admin') {
      return staticTasks;
    }

    return staticTasks.filter(task => task.userId === userId);
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const token = jwtService.getToken();
    if (!token) throw new Error('Not authenticated');

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    if (task.userId !== userId && payload.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const newTask: Task = {
      ...task,
      id: String(staticTasks.length + 1),
    };
    staticTasks.push(newTask);
    return newTask;
  },

  async updateTask(task: Task): Promise<Task> {
    const token = jwtService.getToken();
    if (!token) throw new Error('Not authenticated');

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const existingTask = staticTasks.find(t => t.id === task.id);
    if (!existingTask) throw new Error('Task not found');

    if (existingTask.userId !== userId && payload.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const index = staticTasks.findIndex(t => t.id === task.id);
    staticTasks[index] = task;
    return task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const token = jwtService.getToken();
    if (!token) throw new Error('Not authenticated');

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const task = staticTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (task.userId !== userId && payload.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const index = staticTasks.findIndex(t => t.id === taskId);
    staticTasks.splice(index, 1);
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    const token = jwtService.getToken();
    if (!token) throw new Error('Not authenticated');

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const task = staticTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (task.userId !== userId && payload.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    task.status = status;
    return task;
  }
}; 