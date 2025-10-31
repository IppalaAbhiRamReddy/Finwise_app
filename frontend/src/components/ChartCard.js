import React from 'react';

/**
 * Simple card wrapper for charts: title, optional subtitle, children for chart.
 * Keeps consistent styling across dashboard.
 */
export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4>{title}</h4>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
}