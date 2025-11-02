import api from './axios';

export const categorizeTransaction = (description) => {
  return api.post('ai/categorize-transaction/', { description });
};