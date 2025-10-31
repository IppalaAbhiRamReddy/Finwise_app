import React, { useMemo } from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip, PolarAngleAxis } from 'recharts';
import ChartCard from './ChartCard';
import { useDashboardData } from '../context/DataContext'; // Import the hook

export default function GoalProgressRadial({ goalId = null }) {
  // Get goals data from the context
  const { analytics, loading } = useDashboardData();

  // Find the specific goal to display (or default to the first one)
  const goal = useMemo(() => {
    if (!analytics?.goals) return null;
    if (goalId) return analytics.goals.find(g => g.id === goalId) || analytics.goals[0] || null;
    return analytics.goals[0] || null;
  }, [analytics?.goals, goalId]);

  if (loading) return <ChartCard title="Goal Progress">Loading...</ChartCard>;
  if (!goal) return <ChartCard title="Goal Progress">No goals set</ChartCard>;

  // 'progress' field comes from your Day 10 GoalSerializer
  const data = [{ name: 'Progress', value: goal.progress, fill: '#0088FE' }];

  return (
    <ChartCard title="Goal Progress" subtitle={goal.name}>
      <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width="60%" height={180}>
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={20}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
            <Tooltip />
            <Legend iconType="circle" payload={[{ value: `${goal.progress}%`, type: 'line' }]} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{width:'40%', textAlign:'left', fontSize: '0.9rem'}}>
          <p style={{margin:4}}>Saved: ₹{goal.saved_amount}</p>
          <p style={{margin:4}}>Target: ₹{goal.target_amount}</p>
          <p style={{margin:4}}>Deadline: {goal.deadline}</p>
        </div>
      </div>
    </ChartCard>
  );
}