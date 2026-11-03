import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, Calendar, ClipboardCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="navbar-brand">
          <BookOpen size={22} className="text-primary" />
          <span>Training Management Portal</span>
        </Link>

        <ul className="navbar-links">
          {user.role === 'student' ? (
            <>
              <li>
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/trainings" className={`navbar-link ${isActive('/trainings') ? 'active' : ''}`}>
                  <Calendar size={16} />
                  Available Trainings
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" className={`navbar-link ${isActive('/my-registrations') ? 'active' : ''}`}>
                  <ClipboardCheck size={16} />
                  My Registrations
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/admin" className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/trainings" className={`navbar-link ${isActive('/admin/trainings') ? 'active' : ''}`}>
                  <Calendar size={16} />
                  Manage Trainings
                </Link>
              </li>
              <li>
                <Link to="/admin/registrations" className={`navbar-link ${isActive('/admin/registrations') ? 'active' : ''}`}>
                  <ClipboardCheck size={16} />
                  Student Registrations
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-user">
          <span className={`badge badge-role-${user.role}`}>
            {user.role.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <User size={15} />
            {user.name}
          </span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ background: '#1e293b', color: '#f8fafc', borderColor: '#334155' }}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
