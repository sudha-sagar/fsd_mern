import React, { useState, useEffect } from 'react';
import { fetchAllRegistrations, fetchTrainings, updateRegistrationStatus } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { exportRegistrationsToCsv, printRegistrationsReport } from '../../utils/exportRegistrations';
import { Users, Filter, CheckCircle2, AlertCircle, Calendar, Download, Printer } from 'lucide-react';

const ManageRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      const [regsRes, trainingsRes] = await Promise.all([
        fetchAllRegistrations(),
        fetchTrainings()
      ]);
      setRegistrations(regsRes.data || []);
      setTrainings(trainingsRes.data || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (regId, field, value) => {
    setUpdatingId(regId);
    setFeedback(null);

    const targetReg = registrations.find(r => r._id === regId);
    if (!targetReg) return;

    const payload = {
      attendanceStatus: field === 'attendanceStatus' ? value : targetReg.attendanceStatus,
      completionStatus: field === 'completionStatus' ? value : targetReg.completionStatus
    };

    try {
      const res = await updateRegistrationStatus(regId, payload);
      setFeedback({ type: 'success', text: `Registration status updated for ${targetReg.student?.name || 'student'}.` });
      
      // Update local state smoothly
      setRegistrations(prev =>
        prev.map(r => (r._id === regId ? { ...r, ...payload } : r))
      );
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update registration status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student registrations..." />;
  }

  const filteredRegistrations = selectedTrainingId === 'ALL'
    ? registrations
    : registrations.filter(r => (r.training?._id || r.training) === selectedTrainingId);

  const handleExportCsv = () => {
    exportRegistrationsToCsv(filteredRegistrations, 'student-registrations.csv');
  };

  const handlePrintReport = () => {
    printRegistrationsReport();
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Student Registrations & Records</h1>
          <p className="page-subtitle">Track student enrollment, mark attendance, and manage training completion certificates</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '220px' }}
              value={selectedTrainingId}
              onChange={(e) => setSelectedTrainingId(e.target.value)}
            >
              <option value="ALL">All Training Programs ({registrations.length})</option>
              {trainings.map(t => (
                <option key={t._id} value={t._id}>{t.trainingTitle}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} type="button">
            <Download size={14} />
            Export Excel
          </button>

          <button className="btn btn-primary btn-sm" onClick={handlePrintReport} type="button">
            <Printer size={14} />
            PDF / Print
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {filteredRegistrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <Users size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No student registrations found.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {selectedTrainingId === 'ALL'
              ? 'No students have registered for any training program yet.'
              : 'No students registered for this specific training program.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Training Program</th>
                <th>Enrolled Date</th>
                <th>Current Status</th>
                <th>Attendance Action</th>
                <th>Completion Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{reg.student?.name || 'Student Name'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{reg.student?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#1e293b' }}>
                      {reg.training?.trainingTitle || 'Program Title'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                      Category: {reg.training?.trainingCategory || 'N/A'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <StatusBadge type="attendance" status={reg.attendanceStatus} />
                      <StatusBadge type="completion" status={reg.completionStatus} />
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-control btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', minWidth: '110px' }}
                      value={reg.attendanceStatus || 'not_marked'}
                      disabled={updatingId === reg._id}
                      onChange={(e) => handleStatusChange(reg._id, 'attendanceStatus', e.target.value)}
                    >
                      <option value="not_marked">Not Marked</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', minWidth: '130px' }}
                      value={reg.completionStatus || 'not_completed'}
                      disabled={updatingId === reg._id}
                      onChange={(e) => handleStatusChange(reg._id, 'completionStatus', e.target.value)}
                    >
                      <option value="not_completed">Not Completed</option>
                      <option value="completed">Completed</option>
                    </select>
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

export default ManageRegistrations;
