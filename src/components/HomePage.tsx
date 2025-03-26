import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Task } from '../types/Task';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiService.getTasks,
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <div className="header-top">
            <h1>Task Management System</h1>
            <div className="login-buttons">
              <Link to="/login" className="login-button">User Login</Link>
              <Link to="/admin/login" className="login-button admin">Admin Login</Link>
            </div>
          </div>
          <p className="header-subtitle">View all current tasks in the system</p>
        </header>

        <div className="task-grid">
          {tasks.map((task: Task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="task-footer">
                <span className={`status-badge ${task.status}`}>
                  {task.status}
                </span>
                <span className="due-date">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default HomePage; 