import React from 'react'; // Import React library
import { Link } from 'react-router-dom'; // Import Link for navigation
import { getUserData } from '../utils/auth'; // Import helper to decode JWT and get user info

// Import the analytics components that will be displayed on the dashboard
import ExpenseSummary from './ExpenseSummary';
import MonthlyTrend from './MonthlyTrend';
import CategoryChart from './CategoryChart';
import SavingsTracker from './SavingsTracker';
import PredictedExpense from './PredictedExpense'; // Import prediction component from Day 9

/**
 * The main Dashboard component.
 * Acts as a layout container for the navigation bar and all analytics widgets.
 */
function Dashboard() {
  // Get user data (username, role, etc.) from the JWT stored in localStorage
  const userData = getUserData();

  // Function to handle user logout
  const handleLogout = () => {
    // Remove the JWT tokens from browser storage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    // Redirect the user to the login page and force a full page reload
    // This ensures any sensitive state in React is cleared.
    window.location.href = '/login';
  };

  // Render the dashboard UI
  return (
    // Main container for the dashboard layout
    <div className="dashboard-container">

      {/* Top navigation bar */}
      <nav className="dashboard-nav">
        {/* Dashboard Title */}
        <h2>FinWise Dashboard</h2>
        {/* Right-aligned navigation items */}
        <div>
          {/* Display welcome message with username and role */}
          <span>Welcome, {userData?.username} ({userData?.role})</span>
          {/* Navigation link to the profile page */}
          <Link to="/profile" className="nav-link">Profile</Link>
          {/* Navigation link to the Budgets page (Added in Day 10) */}
          <Link to="/budgets" className="nav-link">Budgets</Link>
          {/* Navigation link to the Goals page (Added in Day 10) */}
          <Link to="/goals" className="nav-link">Goals</Link>
          {/* Conditionally render the Admin link only if the user's role is 'admin' */}
          {userData?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {/* Logout button */}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>

      {/* Main content area below the navigation bar */}
      <div className="dashboard-content">

        {/* Row 1: Display the summary cards (Income, Expense, Savings) */}
        <ExpenseSummary />

        {/* Row 2: Grid layout for the charts */}
        <div className="charts-grid">
          {/* Left column containing the monthly trend line chart */}
          <div className="chart-box">
            <MonthlyTrend months={6} /> {/* Fetch data for the last 6 months */}
          </div>
          {/* Right column containing the category pie chart, savings tracker, and prediction */}
          <div className="chart-box">
            <CategoryChart /> {/* Fetches data based on default range or props */}
            {/* Display the savings progress bar, passing a target */}
            {/* Note: If you refactor to fetch data in Dashboard, pass currentSavings */}
            <SavingsTracker monthlyTarget={10000} />
            {/* Display the next month's expense prediction */}
            <PredictedExpense />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the component for use in App.js
export default Dashboard;