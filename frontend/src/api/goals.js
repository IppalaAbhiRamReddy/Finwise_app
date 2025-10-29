import api from './axios';

export const getGoals = () => api.get('goals/');
export const createGoal = (payload) => api.post('goals/', payload);
export const updateGoal = (id, payload) => api.put(`goals/${id}/`, payload);
export const deleteGoal = (id) => api.delete(`goals/${id}/`);