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
    // Tenta pegar o token do formato persistido pelo Supabase
    // Opcional: Se estiver usando supabase.auth diretamente, pode ser necessário 
    // buscar em localStorage.getItem('sb-psvnyttmczqymhdzofid-auth-token')
    const sessionStr = localStorage.getItem('supabase.auth.token') || localStorage.getItem('sb-hgfpuadujzousfpqvjbu-auth-token');
    
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const token = session.access_token || session.currentSession?.access_token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('[API Interceptor] Erro ao parsear sessão', e);
      }
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
