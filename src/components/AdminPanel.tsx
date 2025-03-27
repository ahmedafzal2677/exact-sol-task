import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks, updateTask, deleteTask, updateTaskStatus, createTask } from '../store/taskSlice';
import { Task } from '../types/Task';
import TaskForm from './TaskForm';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  
  const { tasks, isLoading } = useAppSelector(state => state.tasks);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setShowForm(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
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

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="user-info">Welcome, {user?.name}</p>
          </div>
          <button className="btn-create" onClick={handleCreateTask}>
            Create New Task
          </button>
        </div>
        <div className="admin-stats">
          <div className="stat-item">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {tasks.filter(task => task.status === 'completed').length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {tasks.filter(task => task.status === 'in-progress').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </header>

      <main className="admin-content">
        <div className="task-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-footer">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                  className="status-select"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="task-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleTaskClick(task)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="task-meta">
                <span>Assigned to: {task.userId}</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
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

export default AdminPanel; 