import React from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../utils/auth'; // Auth helper from Day 7

// Import your analytics components
import ExpenseSummary from './ExpenseSummary';
import MonthlyTrend from './MonthlyTrend';
import CategoryChart from './CategoryChart';
import SavingsTracker from './SavingsTracker';
import PredictedExpense from './PredictedExpense'; // <-- Import the new component

/**
 * The main dashboard page.
 * Acts as a layout container for all analytics components.
 */
function Dashboard() {
  // Get user data from the JWT token to display name/role
  const userData = getUserData();

  // Handle logout: clear tokens and redirect
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login'; // Force reload to clear all state
  };

  return (
    <div className="dashboard-container">
      {/* Top navigation bar */}
      <nav className="dashboard-nav">
        <h2>FinWise Dashboard</h2>
        <div>
          {/* Display user info and role */}
          <span>Welcome, {userData?.username} ({userData?.role})</span>
          {/* Link to profile page */}
          <Link to="/profile" className="nav-link">Profile</Link>
          {/* Conditionally render the Admin link based on role */}
          {userData?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {/* Logout button */}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>

      {/* Main content area */}
      <div className="dashboard-content">
        {/* Row 1: Summary Cards */}
        <ExpenseSummary />

        {/* Row 2: Charts grid */}
        <div className="charts-grid">
          {/* Left column: Monthly Trend */}
          <div className="chart-box">
            <MonthlyTrend months={6} />
          </div>
          {/* Right column: Category Chart, Savings Tracker, and Prediction */}
          <div className="chart-box">
            <CategoryChart />
            {/* Note: Pass summaryData?.savings if you implement the parent fetch */}
            <SavingsTracker monthlyTarget={10000} />
            {/* Add the new prediction component */}
            <PredictedExpense />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;