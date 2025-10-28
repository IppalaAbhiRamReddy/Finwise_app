// src/components/PredictedExpense.js
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Define colors for the bars
const COLORS = {
    'Predicted Income': '#2ca02c', // Green
    'Predicted Expense': '#d62728', // Red
    'Predicted Savings': '#0088FE'  // Blue
};

function PredictedExpense() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('insights/predict-monthly/');
        setPrediction(res.data);
      } catch (err) {
        console.error("Prediction fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.detail || 'Could not fetch prediction.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []); // Fetch on component mount

  if (loading) return <div className="prediction-loading">Loading prediction...</div>;
  if (error) return <div className="prediction-error">Error: {error}</div>;
  if (!prediction) return <div className="prediction-unavailable">Prediction not available.</div>;

  // Prepare data for the BarChart
  const chartData = [
    { name: 'Income', value: prediction.predicted_income },
    { name: 'Expense', value: prediction.predicted_expense },
    { name: 'Savings', value: prediction.predicted_savings },
  ];

  return (
    <div className="prediction-card">
      <h4>Next Month Prediction</h4>
      <p className="prediction-meta">
        Model: {prediction.model_type} 
        {prediction.model_score !== null && ` (Score: ${prediction.model_score})`}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {/* Swapped XAxis and YAxis for vertical bars */}
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={60} />
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Bar dataKey="value" barSize={20}>
             {/* Apply colors based on the data name */}
             {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[`Predicted ${entry.name}`] || '#8884d8'} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PredictedExpense;