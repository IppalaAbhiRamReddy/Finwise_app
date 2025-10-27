import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MonthlyTrend({ months = 6 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await api.get(`analytics/monthly-spending/?months=${months}`);
        const formatted = res.data.months.map(m => ({
          // Format 'YYYY-MM-DD' to 'Jan 2025'
          month: new Date(m.month).toLocaleString('default', { month: 'short', year: 'numeric' }),
          Income: Number(m.income),
          Expense: Number(m.expense),
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch monthly trend:", err);
      }
    };
    fetchTrend();
  }, [months]);

  if (data.length === 0) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="chart-container">
      <h3>Monthly Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Income" stroke="#2ca02c" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Expense" stroke="#d62728" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyTrend;