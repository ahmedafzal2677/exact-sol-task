import React from 'react';
import { Task } from '../types/Task';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onDeleteTask,
  onStatusChange,
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#2BBBAD';
    }
  };


  const handleDeleteClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    onDeleteTask(taskId);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, taskId: string) => {
    e.stopPropagation();
    onStatusChange(taskId, e.target.value as Task['status']);
  };

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="task-card"
          onClick={() => onTaskClick(task)}
        >
          <div className="task-header">
            <h3>{task.title}</h3>
            <div className="task-actions">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e, task.id)}
                className="status-select"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteClick(e, task.id)}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="task-content">
            <p className="task-description">{task.description}</p>
            <div className="task-footer">
              <span
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
              <span className="due-date">Due: {task.dueDate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 