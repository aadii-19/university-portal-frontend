import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

console.log("🚀 BASE URL:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

export const universityAPI = {
    getDashboard: () => api.get('/dashboard'),
    getCourses: () => api.get('/courses'),
    getEvents: () => api.get('/events'),
    getNews: () => api.get('/news'),
};

// Export base api if needed elsewhere
export default api;
