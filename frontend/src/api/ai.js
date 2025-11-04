import api from './axios';

export const categorizeTransaction = (description) => {
  return api.post('ai/categorize-transaction/', { description });
};

export const predictSpending = () =>
  api.get('ai/predict-spending/');

export const getSpendingTrend = () =>
  api.get('ai/spending-trend/');