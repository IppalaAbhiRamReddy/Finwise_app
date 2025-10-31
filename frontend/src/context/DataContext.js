import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios'; // Your configured axios instance

// 1. Create the context
const DataContext = createContext(null);

// 2. Create the Provider component
export function DashboardDataProvider({ children }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Run all analytics API calls at the same time
        const [summaryRes, trendRes, categoryRes, goalsRes, predictionRes] = await Promise.all([
          api.get('analytics/savings-vs-expense/'),
          api.get('analytics/monthly-spending/?months=6'),
          api.get('analytics/category-spending/'),
          api.get('goals/'), // For the Goal Progress chart
          api.get('insights/predict-monthly/') // For the Prediction chart
        ]);

        // Combine all results into one state object
        setAnalytics({
          summary: summaryRes.data,
          trend: trendRes.data.months,
          categories: categoryRes.data.categories,
          goals: goalsRes.data,
          prediction: predictionRes.data,
        });

      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []); // Empty array means this runs only once when the provider mounts

  return (
    <DataContext.Provider value={{ analytics, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

// 3. Create a custom hook to easily access the data
export const useDashboardData = () => {
  return useContext(DataContext);
};