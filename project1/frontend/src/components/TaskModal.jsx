import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Calendar, User, AlertCircle, MessageSquare, Trash2, Save } from 'lucide-react';

export default function TaskModal({ task: initialTask, projectMembers, onClose, onTaskUpdated, onTaskDeleted }) {
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState(initialTask);
  const [title, setTitle] = useState(initialTask.title);
  const [description, setDescription] = useState(initialTask.description);
  const [status, setStatus] = useState(initialTask.status);
  const [priority, setPriority] = useState(initialTask.priority);
  const [dueDate, setDueDate] = useState(
    initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
  );
  const [assignee, setAssignee] = useState(initialTask.assignee?._id || '');
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync task state if initialTask changes (e.g. via real-time WebSocket update)
  useEffect(() => {
    setTask(initialTask);
    if (!isEditing) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '');
      setAssignee(initialTask.assignee?._id || '');
    }
  }, [initialTask, isEditing]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || null,
          assignee: assignee || null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }

      onTaskUpdated(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
      }

      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError('');
    const text = newComment;
    setNewComment(''); // Optimistically clear input

    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }

      onTaskUpdated(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCommentDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '750px' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {error && (
          <div className="error-alert" style={{ marginTop: '10px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdateTask}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            {isEditing ? (
              <input
                type="text"
                className="input-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ fontSize: '1.4rem', fontWeight: 600, padding: '6px 12px' }}
              />
            ) : (
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>{task.title}</h2>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {isEditing ? (
                <>
                  <button type="submit" className="primary-btn" style={{ padding: '6px 14px' }} disabled={loading}>
                    <Save size={16} /> Save
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: '6px 14px' }}
                    onClick={() => {
                      setIsEditing(false);
                      // reset values
                      setTitle(task.title);
                      setDescription(task.description);
                      setStatus(task.status);
                      setPriority(task.priority);
                      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                      setAssignee(task.assignee?._id || '');
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: '6px 14px' }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Task
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onClick={handleDeleteTask}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="task-detail-grid">
            {/* Left side: description and comments */}
            <div className="task-detail-left">
              <div>
                <h3 className="detail-label">Description</h3>
                {isEditing ? (
                  <textarea
                    className="input-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                ) : (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {task.description || <span style={{ color: 'var(--text-dark)' }}>No description provided.</span>}
                  </p>
                )}
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3 className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} /> Comments ({task.comments?.length || 0})
                </h3>

                <div className="comments-list">
                  {task.comments?.length === 0 ? (
                    <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                      No comments yet. Start the conversation below!
                    </p>
                  ) : (
                    task.comments?.map((c) => (
                      <div key={c._id} className="comment-item">
                        <div className="comment-avatar">
                          {c.author?.name.substring(0, 2)}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author-name">{c.author?.name}</span>
                            <span className="comment-time">{formatCommentDate(c.createdAt)}</span>
                          </div>
                          <div className="comment-text">{c.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="comment-input-area">
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="button" className="comment-submit-btn" onClick={handleAddComment}>
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Metadata panel */}
            <div className="task-detail-right">
              <div>
                <h3 className="detail-label">Status</h3>
                {isEditing ? (
                  <select className="input-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                ) : (
                  <span className="detail-value">{task.status}</span>
                )}
              </div>

              <div>
                <h3 className="detail-label">Priority</h3>
                {isEditing ? (
                  <select className="input-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className="detail-value">{task.priority}</span>
                )}
              </div>

              <div>
                <h3 className="detail-label">Due Date</h3>
                {isEditing ? (
                  <input
                    type="date"
                    className="input-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                ) : (
                  <span className="detail-value">
                    {task.dueDate ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      'No due date'
                    )}
                  </span>
                )}
              </div>

              <div>
                <h3 className="detail-label">Assignee</h3>
                {isEditing ? (
                  <select className="input-control" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                    <option value="">Unassigned</option>
                    {projectMembers?.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {task.assignee ? (
                      <>
                        <div className="task-card-assignee" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                          {task.assignee.name.substring(0, 2)}
                        </div>
                        <span>{task.assignee.name}</span>
                      </>
                    ) : (
                      'Unassigned'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
