import api from './axios'; // Your configured axios instance

// Get all transactions for logged-in user (or admin sees all)
export const getTransactions = () => api.get('transactions/');

// Create a new transaction
export const createTransaction = (payload) => api.post('transactions/', payload);

// Update transaction by ID
export const updateTransaction = (id, payload) => api.put(`transactions/${id}/`, payload);

// Delete transaction by ID
export const deleteTransaction = (id) => api.delete(`transactions/${id}/`);
