import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { Task } from '../types/Task';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteTask, updateTaskStatus } from '../store/taskSlice';
import { apiService } from '../services/api';
import { websocketService } from '../services/websocket';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const user = useAppSelector((state) => state.auth.user);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiService.getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: apiService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: apiService.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: apiService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      apiService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  useEffect(() => {
    websocketService.connect();

    const unsubscribeTaskUpdate = websocketService.subscribeToTaskUpdates((task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    const unsubscribeTaskCreate = websocketService.subscribeToTaskCreation((task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    const unsubscribeTaskDelete = websocketService.subscribeToTaskDeletion((taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    return () => {
      unsubscribeTaskUpdate();
      unsubscribeTaskCreate();
      unsubscribeTaskDelete();
      websocketService.disconnect();
    };
  }, [queryClient]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Task Dashboard</h1>
            <p className="user-info">Welcome, {user?.name}</p>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button className="btn-admin" onClick={() => window.location.href = '/admin'}>
                Admin Panel
              </button>
            )}
            <button className="btn-create" onClick={handleCreateTask}>
              Create New Task
            </button>
          </div>
        </div>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {tasks.filter((task) => task.status === 'completed').length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {tasks.filter((task) => task.status === 'in-progress').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        <TaskList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      </main>
      {showForm && (
        <TaskForm
          task={selectedTask}
          onSubmit={(taskData) => {
            if (selectedTask) {
              updateTaskMutation.mutate({ ...taskData, id: selectedTask.id });
            } else {
              createTaskMutation.mutate(taskData);
            }
            setShowForm(false);
            setSelectedTask(undefined);
          }}
          onClose={() => {
            setShowForm(false);
            setSelectedTask(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard; 