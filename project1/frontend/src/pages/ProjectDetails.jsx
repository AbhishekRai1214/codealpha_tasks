import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Plus, Users, ArrowLeft, Send, X, Calendar, UserPlus, CheckCircle, Clock, PlayCircle, Eye } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function ProjectDetails() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { socket, addNotificationManual } = useContext(SocketContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals & Panels
  const [selectedTask, setSelectedTask] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Inline Task Creators (per column)
  const [activeCreatorColumn, setActiveCreatorColumn] = useState(''); // 'To Do', 'In Progress', 'In Review', 'Done'
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Columns definition
  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
  }, [projectId, user]);

  // Handle Socket Join / Leave Room & Real-time events
  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('joinProjectRoom', projectId);

    socket.on('taskCreated', (task) => {
      setTasks((prev) => {
        // Prevent duplicate if this client created it
        if (prev.some((t) => t._id === task._id)) return prev;
        return [task, ...prev];
      });
      addNotificationManual(`New task "${task.title}" added to the board.`, 'TASK_CREATED');
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      
      // Sync the task modal if it is displaying this task
      setSelectedTask((current) => {
        if (current && current._id === updatedTask._id) {
          return updatedTask;
        }
        return current;
      });
    });

    socket.on('taskDeleted', ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      
      // Close task modal if deleted task is selected
      setSelectedTask((current) => {
        if (current && current._id === taskId) {
          return null;
        }
        return current;
      });
    });

    socket.on('projectUpdated', (updatedProject) => {
      setProject(updatedProject);
    });

    return () => {
      socket.emit('leaveProjectRoom', projectId);
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
      socket.off('projectUpdated');
    };
  }, [socket, projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch project');
      setProject(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find the task in state
    const originalTask = tasks.find(t => t._id === taskId);
    if (!originalTask || originalTask.status === targetStatus) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status on server');
      }
      
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setTasks(prev => prev.map(t => t._id === taskId ? originalTask : t));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          status: activeCreatorColumn,
          priority: newPriority,
          dueDate: newDueDate || null,
          assignee: newAssignee || null,
          project: projectId
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Clear forms
        setNewTitle('');
        setNewDesc('');
        setNewPriority('Medium');
        setNewAssignee('');
        setNewDueDate('');
        setActiveCreatorColumn('');
      } else {
        alert(data.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();
      if (response.ok) {
        setProject(data);
        setInviteEmail('');
        setIsInviteOpen(false);
      } else {
        setInviteError(data.message || 'Failed to invite member');
      }
    } catch (err) {
      setInviteError('Server error inviting member');
    } finally {
      setInviteLoading(false);
    }
  };

  const getColumnIcon = (column) => {
    switch (column) {
      case 'To Do': return <Clock size={16} style={{ color: 'var(--text-muted)' }} />;
      case 'In Progress': return <PlayCircle size={16} style={{ color: 'var(--primary)' }} />;
      case 'In Review': return <Eye size={16} style={{ color: 'var(--warning)' }} />;
      case 'Done': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      default: return null;
    }
  };

  if (error) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Access Error</h2>
        <p>{error}</p>
        <button className="primary-btn" style={{ margin: '20px auto' }} onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p>Loading board details...</p>
      </div>
    );
  }

  return (
    <div className="board-container">
      {/* Board Header */}
      <div className="board-header">
        <div className="board-header-left">
          <button className="secondary-btn" style={{ padding: '6px 12px', marginBottom: '12px', fontSize: '0.85rem' }} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to Boards
          </button>
          <h1 className="board-project-title">{project.name}</h1>
          <div className="board-project-meta">
            <span>Created by {project.owner.name}</span>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} />
              <span>{project.members.length} member(s)</span>
              <div className="members-avatars">
                {project.members.slice(0, 5).map((m) => (
                  <div key={m._id} className="member-avatar-stacked" title={m.name}>
                    {m.name.substring(0, 2)}
                  </div>
                ))}
                {project.members.length > 5 && (
                  <div className="member-avatar-stacked" style={{ background: '#475569' }}>
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="board-actions">
          <button className="secondary-btn" onClick={() => setIsInviteOpen(!isInviteOpen)}>
            <UserPlus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* Invite Member Popup Panel */}
      {isInviteOpen && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', position: 'relative', animation: 'fadeIn 0.2s' }}>
          <button className="modal-close" onClick={() => setIsInviteOpen(false)} style={{ top: '10px', right: '10px' }}>
            <X size={16} />
          </button>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Invite collaborator by Email</h3>
          {inviteError && <div className="error-alert" style={{ padding: '8px', fontSize: '0.85rem' }}>{inviteError}</div>}
          
          <form onSubmit={handleInviteMember} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
            <input
              type="email"
              className="input-control"
              placeholder="collaborator@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn" disabled={inviteLoading}>
              {inviteLoading ? 'Sending...' : 'Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Kanban Board Columns */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading board columns...</div>
      ) : (
        <div className="board-columns">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column);
            return (
              <div
                key={column}
                className="board-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="board-column-header">
                  <div className="column-title">
                    {getColumnIcon(column)}
                    <span>{column}</span>
                  </div>
                  <span className="column-task-count">{columnTasks.length}</span>
                </div>

                {/* Tasks List */}
                <div className="board-tasks-list">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                    >
                      <TaskCard task={task} onClick={() => setSelectedTask(task)} />
                    </div>
                  ))}

                  {/* Inline Task Creator Form */}
                  {activeCreatorColumn === column ? (
                    <form onSubmit={handleCreateTask} className="glass-panel" style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Task title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        autoFocus
                      />
                      <textarea
                        className="input-control"
                        placeholder="Task description (optional)..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        rows="2"
                        style={{ fontSize: '0.85rem', resize: 'vertical' }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Assignee</label>
                          <select className="input-control" style={{ fontSize: '0.8rem', padding: '6px' }} value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                            <option value="">Unassigned</option>
                            {project.members.map((m) => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Priority</label>
                          <select className="input-control" style={{ fontSize: '0.8rem', padding: '6px' }} value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Due Date</label>
                        <input
                          type="date"
                          className="input-control"
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                        <button type="button" className="secondary-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setActiveCreatorColumn('')}>
                          Cancel
                        </button>
                        <button type="submit" className="primary-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                          Add Task
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="secondary-btn"
                      style={{ borderStyle: 'dashed', justifyContent: 'center', width: '100%', padding: '8px' }}
                      onClick={() => {
                        setActiveCreatorColumn(column);
                        setNewTitle('');
                        setNewDesc('');
                      }}
                    >
                      <Plus size={14} /> Add Card
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectMembers={project.members}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updatedTask) => {
            setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
            setSelectedTask(updatedTask);
          }}
          onTaskDeleted={(taskId) => {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
