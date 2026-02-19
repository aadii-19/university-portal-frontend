import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

console.log("🚀 BASE URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AUTH API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// UNIVERSITY API
export const universityAPI = {
  getEvents: () => api.get('/events'),
  getNews: () => api.get('/news'),
  getDashboard: () => api.get('/dashboard'),
  getCourses: () => api.get('/courses'),
};

export default api;
