import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/Employee/Dashboard';
import HRLayout from './pages/HR/HRLayout';
import EmployeeListing from './pages/HR/EmployeeListing';
import SalaryStatistics from './pages/HR/SalaryStatistics';
import JobTitleStatistics from './pages/HR/JobTitleStatistics';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, token } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          token
            ? <Navigate to={user?.role === 'hr' ? "/hr" : "/dashboard"} replace />
            : <Login />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<EmployeeListing />} />
        <Route path="salary-stats" element={<SalaryStatistics />} />
        <Route path="job-title-stats" element={<JobTitleStatistics />} />
      </Route>
      <Route path="/hr/dashboard" element={<Navigate to="/hr/employees" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
