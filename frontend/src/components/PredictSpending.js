import React, { useEffect, useState } from 'react';
import { predictSpending } from '../api/ai';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import ChartCard from './ChartCard'; // Reuse ChartCard from Day 11

export default function PredictSpending() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await predictSpending();
        if (!mounted) return;
        
        const preds = res.data.predictions || [];
        // Format data for the chart, taking top 5 predictions
        const chartData = preds.slice(0, 5).map(p => ({ 
          category: p.category, 
          predicted: p.predicted,
        }));
        
        setData(chartData);
        setMeta({ 
          last_month: new Date(res.data.last_month).toLocaleString('default', { month: 'short' }),
          last_totals: res.data.last_totals 
        });
      } catch (err) {
        console.error('PredictSpending error', err);
        setError(err.response?.data?.detail || "Could not load predictions.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) return <ChartCard title="Next Month Spend Prediction">Loading...</ChartCard>;
  if (error) return <ChartCard title="Next Month Spend Prediction"><div className="prediction-error">{error}</div></ChartCard>;
  if (!data.length) return <ChartCard title="Next Month Spend Prediction">No predictions available</ChartCard>;

  return (
    <ChartCard 
      title="Predicted Spend (Top 5)" 
      subtitle={`For Next Month (vs. ${meta.last_month})`}
    >
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              interval={0} 
              angle={-35} 
              textAnchor="end" 
              height={70} 
              fontSize={12} 
            />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="predicted" name="Predicted (₹)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}