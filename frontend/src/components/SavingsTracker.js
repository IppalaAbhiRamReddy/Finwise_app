import React, { useEffect, useState } from 'react';
import api from '../api/axios';

function SavingsTracker({ monthlyTarget = 10000 }) {
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const res = await api.get('analytics/savings-vs-expense/');
        setSavings(Number(res.data.savings));
      } catch (err) { 
        console.error("Failed to fetch savings:", err); 
      }
    };
    fetchSavings();
  }, []);

  const percent = Math.max(0, Math.min(100, Math.round((savings / monthlyTarget) * 100)));

  return (
    <div className="savings-tracker">
      <h3>Monthly Savings Progress</h3>
      <p>Saved: ₹{savings.toFixed(2)} of ₹{monthlyTarget} ({percent}%)</p>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-filler"
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}

export default SavingsTracker;