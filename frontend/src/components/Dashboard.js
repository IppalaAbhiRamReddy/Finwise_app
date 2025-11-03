import React from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../utils/auth';
import { useDashboardData } from '../context/DataContext'; // Import the hook

// Import your new "dumb" components
import ExpenseSummary from './ExpenseSummary';
import MonthlyBarChart from './MonthlyBarChart';
import IncomeExpenseDonut from './IncomeExpenseDonut';
import GoalProgressRadial from './GoalProgressRadial';
import PredictSpending from './PredictSpending';

export default function Dashboard() {
  const { loading, error } = useDashboardData(); // Get the global loading/error state
  const userData = getUserData();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>FinWise Dashboard</h2>
        <div>
          <span>Welcome, {userData?.username} ({userData?.role})</span>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/budgets" className="nav-link">Budgets</Link>
          <Link to="/goals" className="nav-link">Goals</Link>
          <Link to="/transactions" className="nav-link">Transactions</Link>
          {userData?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* All components share the same loading/error state */}
        {error ? <div className="error-message">Failed to load dashboard data.</div> : (
          <>
            <ExpenseSummary />

            <div className="charts-grid">
              <div className="main-chart">
                <MonthlyBarChart months={6} />
              </div>

              <div className="side-charts">
                <IncomeExpenseDonut />
                <GoalProgressRadial />
                <PredictSpending />
              </div>
            </div>
          </>
        )}
        {/* A global loading indicator is cleaner */}
        {loading && <div className="dashboard-loading-overlay">Loading data...</div>}
      </div>
    </div>
  );
}