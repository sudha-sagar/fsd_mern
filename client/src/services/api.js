const API_BASE_URL = '/api';

// Helper for HTTP requests
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const registerUser = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const getMe = () => request('/auth/me', { method: 'GET' });

// Training Programs API
export const fetchTrainings = () => request('/trainings', { method: 'GET' });
export const fetchTrainingById = (id) => request(`/trainings/${id}`, { method: 'GET' });
export const createTraining = (trainingData) => request('/trainings', { method: 'POST', body: JSON.stringify(trainingData) });
export const updateTraining = (id, trainingData) => request(`/trainings/${id}`, { method: 'PUT', body: JSON.stringify(trainingData) });
export const deleteTraining = (id) => request(`/trainings/${id}`, { method: 'DELETE' });
export const registerForTraining = (id) => request(`/trainings/${id}/register`, { method: 'POST' });

// Registrations API
export const fetchMyRegistrations = () => request('/registrations/my', { method: 'GET' });
export const fetchAllRegistrations = () => request('/registrations', { method: 'GET' });
export const fetchTrainingRegistrations = (trainingId) => request(`/registrations/training/${trainingId}`, { method: 'GET' });
export const updateRegistrationStatus = (id, statusData) => request(`/registrations/${id}`, { method: 'PUT', body: JSON.stringify(statusData) });
