import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchTrainings, fetchMyRegistrations } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, ClipboardCheck, Award, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [trainingsRes, myRegsRes] = await Promise.all([
          fetchTrainings(),
          fetchMyRegistrations()
        ]);
        setTrainings(trainingsRes.data || []);
        setRegistrations(myRegsRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student dashboard..." />;
  }

  const completedCount = registrations.filter(r => r.completionStatus === 'completed').length;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}!</h1>
        <p className="page-subtitle">Track your training programs, enrollment status, and attendance</p>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Available Programs</div>
            <div className="stat-value">{trainings.length}</div>
          </div>
          <div className="stat-icon">
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">My Enrollments</div>
            <div className="stat-value">{registrations.length}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
            <ClipboardCheck size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Completed Trainings</div>
            <div className="stat-value">{completedCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Recent Registrations Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Recent Enrollments</h2>
          <Link to="/trainings" className="btn btn-secondary btn-sm">
            Browse Trainings
            <ArrowRight size={14} />
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>You haven't registered for any training programs yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>Explore available college training programs and register today.</p>
            <Link to="/trainings" className="btn btn-primary btn-sm">
              View Available Programs
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Training Title</th>
                  <th>Trainer</th>
                  <th>Dates</th>
                  <th>Attendance</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {registrations.slice(0, 5).map((reg) => (
                  <tr key={reg._id}>
                    <td style={{ fontWeight: 600 }}>{reg.training?.trainingTitle || 'N/A'}</td>
                    <td>{reg.training?.trainerName || 'N/A'}</td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>
                      {reg.training?.startDate ? new Date(reg.training.startDate).toLocaleDateString() : ''} -{' '}
                      {reg.training?.endDate ? new Date(reg.training.endDate).toLocaleDateString() : ''}
                    </td>
                    <td>
                      <StatusBadge type="attendance" status={reg.attendanceStatus} />
                    </td>
                    <td>
                      <StatusBadge type="completion" status={reg.completionStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
