import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Kanban } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div className="nav-logo-icon">
          <Kanban size={18} />
        </div>
        <span className="nav-logo-text">CollabFlow</span>
      </Link>

      <div className="nav-links">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user.name.substring(0, 2)}
          </div>
          <span className="user-name">{user.name}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
