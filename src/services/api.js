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
 * Injeta automaticamente o token do Supabase se ele existir no localStorage
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

export default api;
