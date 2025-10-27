import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a8327b', '#6a2c70'];

function CategoryChart({ start, end }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        
        const res = await api.get(`analytics/category-spending/?${params.toString()}`);
        setData(res.data.categories.map(c => ({ 
          name: c.category, 
          value: Number(c.total) 
        })));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [start, end]);

  if (data.length === 0) {
    return <div>No category data to display.</div>;
  }

  return (
    <div className="chart-container">
      <h3>Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;