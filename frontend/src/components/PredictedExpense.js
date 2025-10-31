import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboardData } from '../context/DataContext'; // Import the hook

const COLORS = { 'Income': '#2ca02c', 'Expense': '#d62728', 'Savings': '#0088FE' };

function PredictedExpense() {
  // Get prediction data from the context
  const { analytics, loading } = useDashboardData();

  const { data, pred } = useMemo(() => {
    if (!analytics?.prediction) return { data: [], pred: null };
    const predData = analytics.prediction;
    const chartData = [
      { name: 'Income', value: predData.predicted_income },
      { name: 'Expense', value: predData.predicted_expense },
      { name: 'Savings', value: predData.predicted_savings },
    ];
    return { data: chartData, pred: predData };
  }, [analytics?.prediction]);

  if (loading) return <div>Loading prediction...</div>;
  if (!pred) return <div>Prediction not available</div>;

  return (
    <div className="prediction-card">
      <h4>Next Month Prediction</h4>
      <p className="prediction-meta">
        Model: {pred.model_type} 
        {pred.model_score !== null && ` (Score: ${pred.model_score})`}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" fontSize={12} />
          <YAxis type="category" dataKey="name" width={60} fontSize={12} />
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Bar dataKey="value" barSize={20}>
             {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#8884d8'} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PredictedExpense;