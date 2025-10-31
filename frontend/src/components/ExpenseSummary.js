import React from 'react';
import { useDashboardData } from '../context/DataContext'; // Import the hook to access shared data

/**
 * Renders the three summary cards: Total Income, Total Expense, and Savings.
 * This is now a "dumb" component that just displays data given to it.
 */
function ExpenseSummary() {
  // Get the 'analytics' object and 'loading' state from the parent DataContext
  // This component no longer fetches its own data.
  const { analytics, loading } = useDashboardData();

  // Use the summary data from the context if it exists.
  // If 'analytics' is null (still loading), provide a default object to prevent errors.
  const summary = analytics?.summary || { total_income: '0.00', total_expense: '0.00', savings: '0.00' };

  return (
    <div className="summary-cards">
      <div className="card income-card">
        <h4>Total Income</h4>
        {/* Show "..." while loading, otherwise display the formatted data */}
        <p>{loading ? "..." : `₹${summary.total_income}`}</p>
      </div>
      <div className="card expense-card">
        <h4>Total Expense</h4>
        <p>{loading ? "..." : `₹${summary.total_expense}`}</p>
      </div>
      <div className="card savings-card">
        <h4>Savings</h4>
        <p>{loading ? "..." : `₹${summary.savings}`}</p>
      </div>
    </div>
  );
}

export default ExpenseSummary;