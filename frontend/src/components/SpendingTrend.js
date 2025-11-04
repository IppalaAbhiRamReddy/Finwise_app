import React, { useEffect, useState } from 'react';
import { getSpendingTrend } from '../api/ai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard'; // Use our existing ChartCard

// Colors for the lines
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

function SpendingTrend() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSpendingTrend();
        
        // --- 1. Process data for the line chart ---
        // We need to "pivot" the data from the API
        // From: [{month, category, amount, type}, ...]
        // To:   [{month: "M-2", Food: 100, Transport: 50}, {month: "M-1", ...}]
        
        const pivotedData = {};
        const categories = new Set();
        
        res.data.trends.forEach(d => {
            if (!pivotedData[d.month]) {
                pivotedData[d.month] = { month: d.month };
            }
            // Add a key for the category, e.g., "Food (Actual)" or "Food (Predicted)"
            const key = `${d.category} (${d.type})`;
            pivotedData[d.month][key] = d.amount;
            categories.add(d.category);
        });

        // Ensure the months are in the correct order
        const monthOrder = ["M-2", "M-1", "Last Month", "Next Month"];
        const finalChartData = monthOrder.map(month => pivotedData[month]).filter(Boolean);

        setData({ chartData: finalChartData, categories: Array.from(categories) });
        setInsights(res.data.insights);

      } catch (err) {
        console.error('Error fetching trend:', err);
        setError(err.response?.data?.error || "Could not load trends.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, []);

  // Helper to get insight status color
  const getStatusColor = (status) => {
    if (status === 'overspend') return 'insight-red';
    if (status === 'saving') return 'insight-green';
    return 'insight-grey';
  };

  if (loading) return <ChartCard title="Spending Trends">Loading...</ChartCard>;
  if (error) return <ChartCard title="Spending Trends"><div className="prediction-error">{error}</div></ChartCard>;

  return (
    <div className="spending-trend-container">
      {/* 1. The Line Chart */}
      <ChartCard title="📈 Actual vs. Predicted Spending (Top 5)">
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              {/* Create a pair of lines (Actual/Predicted) for each category */}
              {data.categories.map((cat, idx) => (
                <React.Fragment key={cat}>
                  {/* Actual Spending Line (Solid) */}
                  <Line
                    type="monotone"
                    dataKey={`${cat} (Actual)`}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    connectNulls // Connects line over the "Next Month" gap
                  />
                  {/* Predicted Spending Line (Dashed) */}
                  <Line
                    type="monotone"
                    dataKey={`${cat} (Predicted)`}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="5 5" // Makes it dashed
                    connectNulls // Connects line over the "Actuals" gap
                  />
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 2. The Insights List */}
      <ChartCard title="💡 AI-Powered Insights" subtitle="Based on your trend">
        <div className="insights-list">
          {insights.map((item) => (
            <div key={item.category} className="insight-item">
              <span className="insight-category">{item.category}</span>
              <span className={`insight-status ${getStatusColor(item.status)}`}>
                {item.status === 'overspend' && '▲ Overspend'}
                {item.status === 'saving' && '▼ Saving'}
                {item.status === 'stable' && '● Stable'}
                <span className="insight-percent"> ({item.change_percent > 0 ? '+' : ''}{item.change_percent}%)</span>
              </span>
              <span className="insight-value">
                Pred: <strong>₹{item.predicted}</strong> (Avg: ₹{item.avg_recent})
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

export default SpendingTrend;