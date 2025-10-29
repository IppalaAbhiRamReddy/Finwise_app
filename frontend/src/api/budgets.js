import api from './axios'; // Your configured axios instance

// Function to get all budgets for the logged-in user
export const getBudgets = () => api.get('budgets/');

// Function to create a new budget
export const createBudget = (payload) => api.post('budgets/', payload);

// Function to update an existing budget by its ID
export const updateBudget = (id, payload) => api.put(`budgets/${id}/`, payload);

// Function to delete a budget by its ID
export const deleteBudget = (id) => api.delete(`budgets/${id}/`);