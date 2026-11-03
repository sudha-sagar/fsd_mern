import React, { useState, useEffect } from 'react';
import { fetchTrainings, fetchMyRegistrations, registerForTraining } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Calendar, User, Clock, Tag, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AvailableTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text: '' }

  const loadData = async () => {
    try {
      const [trainingsRes, myRegsRes] = await Promise.all([
        fetchTrainings(),
        fetchMyRegistrations()
      ]);

      setTrainings(trainingsRes.data || []);

      const regSet = new Set((myRegsRes.data || []).map(r => r.training?._id || r.training));
      setRegisteredIds(regSet);
    } catch (err) {
      console.error('Failed to load training programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (trainingId) => {
    setFeedback(null);
    setActionLoading(true);

    try {
      const res = await registerForTraining(trainingId);
      setFeedback({ type: 'success', text: res.message || 'Successfully registered for training program!' });
      setSelectedTraining(null);
      await loadData(); // Reload list to update seats and enrolled status
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to register for training program.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading available training programs..." />;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Available Training Programs</h1>
        <p className="page-subtitle">Browse upcoming engineering college skill development and training programs</p>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {trainings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No training programs available at this time.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Please check back later for new course announcements.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {trainings.map((program) => {
            const isRegistered = registeredIds.has(program._id);
            const isFull = program.availableSeats <= 0;

            return (
              <div key={program._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-pending">
                      <Tag size={12} />
                      {program.trainingCategory}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: isFull ? '#dc2626' : '#166534', fontWeight: 600 }}>
                      {program.availableSeats} seats left
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                    {program.trainingTitle}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.85rem', color: '#475569', margin: '0.75rem 0 1.25rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <User size={14} />
                      <span>Trainer: {program.trainerName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} />
                      <span>Duration: {program.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={14} />
                      <span>
                        {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedTraining(program)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Info size={14} />
                    Details
                  </button>

                  {isRegistered ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{ color: '#166534', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                      <CheckCircle2 size={14} />
                      Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(program._id)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      disabled={isFull || actionLoading}
                    >
                      {isFull ? 'Seats Full' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Details Modal */}
      {selectedTraining && (
        <Modal
          isOpen={Boolean(selectedTraining)}
          onClose={() => setSelectedTraining(null)}
          title="Training Program Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span className="badge badge-pending" style={{ marginBottom: '0.5rem' }}>{selectedTraining.trainingCategory}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{selectedTraining.trainingTitle}</h2>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Trainer:</strong> {selectedTraining.trainerName}</div>
              <div><strong>Category:</strong> {selectedTraining.trainingCategory}</div>
              <div><strong>Duration:</strong> {selectedTraining.duration}</div>
              <div><strong>Start Date:</strong> {new Date(selectedTraining.startDate).toLocaleDateString()}</div>
              <div><strong>End Date:</strong> {new Date(selectedTraining.endDate).toLocaleDateString()}</div>
              <div><strong>Available Seats:</strong> {selectedTraining.availableSeats}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setSelectedTraining(null)} className="btn btn-secondary">
                Close
              </button>
              {registeredIds.has(selectedTraining._id) ? (
                <button className="btn btn-secondary" disabled style={{ color: '#166534', backgroundColor: '#f0fdf4' }}>
                  Already Registered
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(selectedTraining._id)}
                  className="btn btn-primary"
                  disabled={selectedTraining.availableSeats <= 0 || actionLoading}
                >
                  {actionLoading ? 'Registering...' : selectedTraining.availableSeats <= 0 ? 'No Seats Available' : 'Confirm Registration'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AvailableTrainings;
