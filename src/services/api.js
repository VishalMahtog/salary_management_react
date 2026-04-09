import axios from 'axios';

const API_BASE_URL = 'http://localhost:3004';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', {
      employee: { email, password }
    });
    return response.data;
  },
  logout: async () => {
    return await api.delete('/logout');
  },
};

export const hrService = {
  getEmployees: async (page = 1) => {
    const response = await api.get(`/hr/employees?page=${page}`);
    return response.data;
  },
  createEmployee: async (data) => {
    const response = await api.post('/hr/employees', { employee: data });
    return response.data;
  },
  updateEmployee: async (id, data) => {
    const response = await api.put(`/hr/employees/${id}`, { employee: data });
    return response.data;
  },
  deleteEmployee: async (id) => {
    const response = await api.delete(`/hr/employees/${id}`);
    return response.data;
  },
};

export default api;
