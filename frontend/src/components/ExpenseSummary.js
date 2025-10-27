import React, { useEffect, useState } from 'react';
import api from '../api/axios';

function ExpenseSummary() {
  const [summary, setSummary] = useState({ 
    total_income: '0.00', 
    total_expense: '0.00', 
    savings: '0.00' 
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('analytics/savings-vs-expense/');
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="summary-cards">
      <div className="card income-card">
        <h4>Total Income</h4>
        <p>₹{summary.total_income}</p>
      </div>
      <div className="card expense-card">
        <h4>Total Expense</h4>
        <p>₹{summary.total_expense}</p>
      </div>
      <div className="card savings-card">
        <h4>Savings</h4>
        <p>₹{summary.savings}</p>
      </div>
    </div>
  );
}

export default ExpenseSummary;