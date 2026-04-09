import axios from 'axios';

/**
 * 🚀 Instância Centralizada do Axios (Vini's Delivery)
 * BaseURL configurada via .env (VITE_API_URL)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🔐 INTERCEPTOR DE REQUISIÇÃO
 * Injeta automaticamente o token de autenticação se ele existir no localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vinis_auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 📦 INTERCEPTOR DE RESPOSTA
 * Padroniza o retorno conforme o contrato { success, data/error }
 */
api.interceptors.response.use(
  (response) => {
    // Retorna apenas os dados se a resposta for bem-sucedida
    return response.data;
  },
  (error) => {
    // Tratamento de erro padronizado para o frontend
    const message = error.response?.data?.error || 'Erro na comunicação com o servidor';
    console.error('[API Error]', message);
    return Promise.reject(message);
  }
);

/**
 * 🛠️ HELPERS POR MÓDULO
 */
export const products = {
  list: () => api.get('/products'),
  listActive: () => api.get('/products/active'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categories = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orders = {
  list: () => api.get('/orders'),
  listAll: () => api.get('/orders/all'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const cupons = {
  list: () => api.get('/cupons'),
  validate: (codigo, total) => api.post('/cupons/validate', { codigo, total }),
};

export const motoboys = {
  list: () => api.get('/motoboys'),
  create: (data) => api.post('/motoboys', data),
  delete: (id) => api.delete(`/motoboys/${id}`),
};

export const clientes = {
  list: () => api.get('/clientes'),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

export const despesas = {
  list: () => api.get('/despesas'),
  create: (data) => api.post('/despesas', data),
  update: (id, data) => api.put(`/despesas/${id}`, data),
  delete: (id) => api.delete(`/despesas/${id}`),
};

export const caixa = {
  list: () => api.get('/caixa'),
  getResumo: () => api.get('/caixa/resumo'),
  create: (data) => api.post('/caixa', data),
};

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export default api;
