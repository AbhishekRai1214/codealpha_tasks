import React from 'react';
import { Calendar, MessageSquare, User } from 'lucide-react';

export default function TaskCard({ task, onClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        {task.assignee ? (
          <div className="task-card-assignee" title={`Assigned to ${task.assignee.name}`}>
            {task.assignee.name.substring(0, 2)}
          </div>
        ) : (
          <div className="task-card-assignee unassigned-avatar" title="Unassigned">
            <User size={12} />
          </div>
        )}
      </div>

      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      <div className="task-card-footer">
        {task.dueDate ? (
          <div className="task-due-date" title="Due Date">
            <Calendar size={12} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        ) : (
          <div></div>
        )}

        {task.comments && task.comments.length > 0 && (
          <div className="task-comments-count" title="Comments">
            <MessageSquare size={12} />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
