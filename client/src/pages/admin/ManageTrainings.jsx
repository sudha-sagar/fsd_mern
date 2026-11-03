import React, { useState, useEffect } from 'react';
import { fetchTrainings, createTraining, updateTraining, deleteTraining } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { PlusCircle, Edit, Trash2, Calendar, User, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

const emptyForm = {
  trainingTitle: '',
  trainerName: '',
  trainingCategory: '',
  startDate: '',
  endDate: '',
  duration: '',
  availableSeats: 10
};

const ManageTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTrainings = async () => {
    try {
      const res = await fetchTrainings();
      setTrainings(res.data || []);
    } catch (err) {
      console.error('Failed to load trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (program) => {
    setEditingId(program._id);
    setFormData({
      trainingTitle: program.trainingTitle,
      trainerName: program.trainerName,
      trainingCategory: program.trainingCategory,
      startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
      endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : '',
      duration: program.duration,
      availableSeats: program.availableSeats
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(formData.availableSeats) < 0) {
      setError('Available seats cannot be negative.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    setActionLoading(true);

    try {
      if (editingId) {
        await updateTraining(editingId, formData);
        setFeedback({ type: 'success', text: 'Training program updated successfully!' });
      } else {
        await createTraining(formData);
        setFeedback({ type: 'success', text: 'Training program created successfully!' });
      }
      setIsModalOpen(false);
      await loadTrainings();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove associated student registrations.`)) {
      return;
    }

    try {
      await deleteTraining(id);
      setFeedback({ type: 'success', text: `Training program "${title}" deleted successfully.` });
      await loadTrainings();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete training program.' });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading training management table..." />;
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manage Training Programs</h1>
          <p className="page-subtitle">Create, update, or remove engineering college training program listings</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <PlusCircle size={16} />
          Create New Training Program
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {trainings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No training programs configured yet.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            Add Your First Training Program
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title & Category</th>
                <th>Trainer Name</th>
                <th>Dates & Duration</th>
                <th>Available Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.trainingTitle}</div>
                    <span className="badge badge-pending" style={{ marginTop: '0.25rem' }}>
                      <Tag size={10} />
                      {t.trainingCategory}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                      <User size={13} style={{ color: '#64748b' }} />
                      {t.trainerName}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <div>
                      {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Duration: {t.duration}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: t.availableSeats > 0 ? '#166534' : '#dc2626' }}>
                    {t.availableSeats}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(t)} className="btn btn-secondary btn-sm" title="Edit Program">
                        <Edit size={14} />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t._id, t.trainingTitle)} className="btn btn-danger btn-sm" title="Delete Program">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Training Program' : 'Create Training Program'}
      >
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Training Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Full Stack Web Development"
              value={formData.trainingTitle}
              onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trainer Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Prof. Alan Turing"
                value={formData.trainerName}
                onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Software Engineering"
                value={formData.trainingCategory}
                onChange={(e) => setFormData({ ...formData, trainingCategory: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 4 Weeks or 30 Hours"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Seats</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : editingId ? 'Update Program' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTrainings;
