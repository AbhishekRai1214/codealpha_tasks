import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Folder, Plus, Users } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">Manage your collaborative project boards and tasks.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading projects...</div>
      ) : (
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects glass-panel">
              <Folder size={48} className="no-projects-icon" />
              <h3>No projects found</h3>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px 0' }}>
                Get started by creating a new collaborative project board.
              </p>
              <button className="secondary-btn" style={{ margin: '0 auto' }} onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Create Project
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="project-card glass-panel"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div className="project-card-header">
                  <div className="project-name-text">{project.name}</div>
                  <div className="project-desc-text">
                    {project.description || 'No description provided.'}
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-members-count">
                    <Users size={14} />
                    <span>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
                  </div>

                  {project.owner._id === user._id ? (
                    <span className="owner-badge">Owner</span>
                  ) : (
                    <span className="member-badge">Member</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
