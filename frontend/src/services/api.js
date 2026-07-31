import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
<<<<<<< HEAD
  if (import.meta.env.DEV) {
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'login-failed',
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'frontend/src/services/api.js:request',
        msg: '[DEBUG] Frontend request prepared',
        data: {
          method: config.method,
          baseURL: config.baseURL,
          url: config.url,
          origin: window.location.origin,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  }
=======
  // #region debug-point A:frontend-request
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'login-failed',
      runId: 'pre-fix',
      hypothesisId: 'A',
      location: 'frontend/src/services/api.js:request',
      msg: '[DEBUG] Frontend request prepared',
      data: {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        origin: window.location.origin,
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
<<<<<<< HEAD
    if (import.meta.env.DEV) {
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'login-failed',
          runId: 'pre-fix',
          hypothesisId: 'B',
          location: 'frontend/src/services/api.js:response-error',
          msg: '[DEBUG] Frontend request failed',
          data: {
            baseURL: error.config?.baseURL,
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            responseUrl: error.request?.responseURL,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
    }
=======
    // #region debug-point B:frontend-response-error
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'login-failed',
        runId: 'pre-fix',
        hypothesisId: 'B',
        location: 'frontend/src/services/api.js:response-error',
        msg: '[DEBUG] Frontend request failed',
        data: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          responseUrl: error.request?.responseURL,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  verify: () => api.get('/auth/verify'),
};

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: () => api.get('/customers/export', { responseType: 'blob' }),
  getStats: () => api.get('/customers/stats'),
};

export const templateAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const messageLogAPI = {
  getAll: (params) => api.get('/message-logs', { params }),
  getStats: () => api.get('/message-logs/stats'),
};

export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  initialize: () => api.post('/whatsapp/initialize'),
  logout: () => api.post('/whatsapp/logout'),
  restart: () => api.post('/whatsapp/restart'),
  sendTest: (data) => api.post('/whatsapp/test-message', data),
  sendManual: (data) => api.post('/whatsapp/send-message', data),
  getDashboard: () => api.get('/whatsapp/dashboard'),
  getSettings: () => api.get('/whatsapp/settings'),
  updateSettings: (data) => api.put('/whatsapp/settings', data),
  triggerCron: (job) => api.post(`/whatsapp/cron/${job}`),
};

export default api;
