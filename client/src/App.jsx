import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableTrainings from './pages/student/AvailableTrainings';
import MyRegistrations from './pages/student/MyRegistrations';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTrainings from './pages/admin/ManageTrainings';
import ManageRegistrations from './pages/admin/ManageRegistrations';

const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/trainings" element={<AvailableTrainings />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/trainings" element={<ManageTrainings />} />
          <Route path="/admin/registrations" element={<ManageRegistrations />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
