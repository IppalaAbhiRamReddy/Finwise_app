import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { useDashboardData } from '../context/DataContext'; // Import the hook

const COLORS = ['#2ca02c', '#d62728']; // income, expense

export default function IncomeExpenseDonut() {
  // Get summary data from the context
  const { analytics, loading } = useDashboardData();

  const { data, summary } = useMemo(() => {
    if (!analytics?.summary) return { data: [], summary: {} };

    const summaryData = analytics.summary;
    const pieData = [
      { name: 'Income', value: Number(summaryData.total_income) },
      { name: 'Expense', value: Number(summaryData.total_expense) },
    ];
    return { data: pieData, summary: summaryData };
  }, [analytics?.summary]);

  return (
    <ChartCard title="Total Income vs Expense" subtitle="All Time">
      {loading ? <div>Loading...</div> : (
        <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="60%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={5}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ width: '40%', textAlign: 'left', fontSize: '0.9rem' }}>
            <p style={{margin:4}}>Income: <strong>₹{summary.total_income}</strong></p>
            <p style={{margin:4}}>Expense: <strong>₹{summary.total_expense}</strong></p>
            <p style={{margin:4, fontWeight: 'bold'}}>Savings: <strong>₹{summary.savings}</strong></p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}