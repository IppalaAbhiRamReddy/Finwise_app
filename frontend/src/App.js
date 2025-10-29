import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Core Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Unauthorized from './components/Unauthorized';

// Import Feature Components
import Budgets from './components/Budgets';
import Goals from './components/Goals';

// Import Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Import CSS
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* Accessible to everyone */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* --- Protected Routes --- */}
        {/* Accessible only to logged-in users */}
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
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <Budgets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />

        {/* --- Role-Protected Route --- */}
        {/* Accessible only to logged-in users with the 'admin' role */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <h2>Admin Only Page</h2>
              {/* You could render a specific Admin Dashboard component here */}
            </RoleBasedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;