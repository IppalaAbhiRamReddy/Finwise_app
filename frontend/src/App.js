import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import Core Components ---
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Unauthorized from './components/Unauthorized';

// --- Import Feature Components ---
import Budgets from './components/Budgets'; // From Day 10
import Goals from './components/Goals';     // From Day 10

// --- Import Route Guards ---
import ProtectedRoute from './components/ProtectedRoute';   // From Day 6
import RoleBasedRoute from './components/RoleBasedRoute'; // From Day 7

// --- Import Context Providers ---
import { DashboardDataProvider } from './context/DataContext'; // From Day 11

// --- Import CSS ---
import './App.css';

/**
 * Main application component.
 * Handles all client-side routing for the entire application.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* === Public Routes === */}
        {/* These routes are accessible to everyone (logged out users) */}
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} /> {/* Default route redirects to Login */}
        <Route path="/unauthorized" element={<Unauthorized />} /> {/* Page for 403 Forbidden */}

        {/* === Protected Routes === */}
        {/* These routes require the user to be logged in (checked by ProtectedRoute) */}
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* Wrap the Dashboard in the DataProvider.
                This fetches all analytics data *only* when the dashboard is loaded,
                making it available to the Dashboard and all its children.
              */}
              <DashboardDataProvider>
                <Dashboard />
              </DashboardDataProvider>
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

        {/* === Admin-Only Protected Route === */}
        {/* Requires user to be logged in AND have the 'admin' role */}
        
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