import React from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../utils/auth';

// Import your new analytics components
import ExpenseSummary from './ExpenseSummary';
import MonthlyTrend from './MonthlyTrend';
import CategoryChart from './CategoryChart';
import SavingsTracker from './SavingsTracker';

function Dashboard() {
  const userData = getUserData();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login'; // Force reload to clear state
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>FinWise Dashboard</h2>
        <div>
          <span>Welcome, {userData?.username} ({userData?.role})</span>
          <Link to="/profile" className="nav-link">Profile</Link>
          {userData?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <ExpenseSummary />
        
        <div className="charts-grid">
          <div className="chart-box">
            <MonthlyTrend months={6} />
          </div>
          <div className="chart-box">
            <CategoryChart />
            <SavingsTracker monthlyTarget={10000} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;