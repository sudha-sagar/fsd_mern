import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchTrainings, fetchAllRegistrations } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportRegistrationsToCsv, printRegistrationsReport } from '../../utils/exportRegistrations';
import { Calendar, Users, PlusCircle, ClipboardCheck, ArrowRight, User, Download, Printer } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [trainingsRes, regsRes] = await Promise.all([
          fetchTrainings(),
          fetchAllRegistrations()
        ]);
        setTrainings(trainingsRes.data || []);
        setRegistrations(regsRes.data || []);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading admin control panel..." />;
  }

  const upcomingCount = trainings.filter(t => new Date(t.startDate) >= new Date()).length;

  const handleExportRegistrations = () => {
    exportRegistrationsToCsv(registrations, 'all-student-registrations.csv');
  };

  const handlePrintRegistrations = () => {
    printRegistrationsReport();
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage training program listings, student registrations, and records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/trainings" className="btn btn-primary">
            <PlusCircle size={16} />
            Manage Programs
          </Link>
          <Link to="/admin/registrations" className="btn btn-secondary">
            <ClipboardCheck size={16} />
            View Registrations
          </Link>
          <button className="btn btn-secondary btn-sm" type="button" onClick={handleExportRegistrations}>
            <Download size={14} />
            Export Excel
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={handlePrintRegistrations}>
            <Printer size={14} />
            PDF / Print
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Training Programs</div>
            <div className="stat-value">{trainings.length}</div>
          </div>
          <div className="stat-icon">
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Student Registrations</div>
            <div className="stat-value">{registrations.length}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Upcoming Programs</div>
            <div className="stat-value">{upcomingCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Active Trainings Table Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Training Programs Overview</h2>
          <Link to="/admin/trainings" className="btn btn-secondary btn-sm">
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {trainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No training programs created yet.</p>
            <Link to="/admin/trainings" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Create First Program
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Trainer</th>
                  <th>Category</th>
                  <th>Start / End Dates</th>
                  <th>Available Seats</th>
                </tr>
              </thead>
              <tbody>
                {trainings.slice(0, 5).map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.trainingTitle}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <User size={13} style={{ color: '#64748b' }} />
                        {t.trainerName}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-pending">{t.trainingCategory}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600, color: t.availableSeats > 0 ? '#166534' : '#dc2626' }}>
                      {t.availableSeats}
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

export default AdminDashboard;
