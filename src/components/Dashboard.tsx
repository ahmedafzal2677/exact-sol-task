import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { Task } from '../types/Task';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../store/taskSlice';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  
  const { tasks, isLoading, error } = useAppSelector(state => state.tasks);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTask(taskId));
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    dispatch(updateTaskStatus({ taskId, status: newStatus }));
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id'>) => {
    if (selectedTask) {
      dispatch(updateTask({ ...taskData, id: selectedTask.id }));
    } else {
      dispatch(createTask(taskData));
    }
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Task Dashboard</h1>
            <p className="user-info">Welcome, {user?.name}</p>
          </div>
          <button className="btn-create" onClick={handleCreateTask}>
            Create New Task
          </button>
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
          onClose={() => setShowForm(false)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard; 