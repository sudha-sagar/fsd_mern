import React, { useState, useEffect } from 'react';
import { fetchMyRegistrations } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { ClipboardCheck, Calendar, User, Tag } from 'lucide-react';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyRegistrations = async () => {
      try {
        const res = await fetchMyRegistrations();
        setRegistrations(res.data || []);
      } catch (err) {
        console.error('Failed to load my registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMyRegistrations();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your training registrations..." />;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">My Registered Trainings</h1>
        <p className="page-subtitle">View your active training enrollments, attendance status, and course completion records</p>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <ClipboardCheck size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No training registrations found.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>You have not enrolled in any training programs yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Training Program</th>
                <th>Trainer & Category</th>
                <th>Program Dates</th>
                <th>Enrolled On</th>
                <th>Attendance</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {reg.training?.trainingTitle || 'Training Title Unavailable'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.125rem' }}>
                      Duration: {reg.training?.duration || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                      <User size={13} style={{ color: '#64748b' }} />
                      {reg.training?.trainerName || 'N/A'}
                    </div>
                    <span className="badge badge-pending" style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                      <Tag size={10} />
                      {reg.training?.trainingCategory || 'General'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={13} />
                      {reg.training?.startDate ? new Date(reg.training.startDate).toLocaleDateString() : 'N/A'} -{' '}
                      {reg.training?.endDate ? new Date(reg.training.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'}
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
  );
};

export default MyRegistrations;
