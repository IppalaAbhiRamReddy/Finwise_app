import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute'; // <-- New
import Profile from './components/Profile';               // <-- New
import Unauthorized from './components/Unauthorized';     // <-- New

// Import CSS
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes (Must be logged in) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Route (Must be Admin) */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <h2>Admin Only Page</h2>
              {/* You could put a special <AdminDashboard /> here */}
            </RoleBasedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;