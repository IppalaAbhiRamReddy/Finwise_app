import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';
import { useDashboardData } from '../context/DataContext'; // Import the hook

export default function MonthlyBarChart({ months = 6 }) {
  // Get data from the context, not by fetching
  const { analytics, loading } = useDashboardData();

  // Format the data only when analytics.trend changes
  const formattedData = useMemo(() => {
    if (!analytics?.trend) return [];
    return analytics.trend.map(m => ({
      month: new Date(m.month).toLocaleString('default', { month: 'short' }),
      Income: Number(m.income),
      Expense: Number(m.expense),
    }));
  }, [analytics?.trend]);

  return (
    <ChartCard title="Monthly Income vs Expense" subtitle={`${months} months`}>
      {loading ? <div>Loading chart...</div> : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Income" fill="#2ca02c" />
            <Bar dataKey="Expense" fill="#d62728" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}