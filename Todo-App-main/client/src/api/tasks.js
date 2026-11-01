import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getTasks      = (params = {}) => api.get('/tasks', { params });
export const getStats      = ()             => api.get('/tasks/stats');
export const createTask    = (data)         => api.post('/tasks', data);
export const updateTask    = (id, data)     => api.put(`/tasks/${id}`, data);
export const completeTask  = (id)           => api.patch(`/tasks/${id}/complete`);
export const uncompleteTask= (id)           => api.patch(`/tasks/${id}/uncomplete`);
export const deleteTask    = (id)           => api.delete(`/tasks/${id}`);
