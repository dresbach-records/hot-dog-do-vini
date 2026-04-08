import api from '../services/api';

/**
 * ⚡ SUPABASE SHIM (Vini's VPS Migration)
 * Este arquivo substitui o cliente Original do Supabase por um "wrapper" 
 * que traduz as chamadas para a nossa nova API local baseada em MariaDB/Node.js.
 * 
 * Isso permite que páginas legadas continuem funcionando sem refatoração imediata.
 */

class SupabaseShim {
  constructor() {
    this.auth = {
      getSession: async () => {
        const token = localStorage.getItem('vinis_auth_token');
        const user = JSON.parse(localStorage.getItem('vinis_user') || 'null');
        return { data: { session: token ? { access_token: token, user } : null }, error: null };
      },
      onAuthStateChange: (callback) => {
        const handleAuth = () => {
          this.auth.getSession().then(({ data: { session } }) => {
            callback('SIGNED_IN', session);
          });
        };
        window.addEventListener('auth_change', handleAuth);
        return { data: { subscription: { unsubscribe: () => window.removeEventListener('auth_change', handleAuth) } } };
      },
      signInWithPassword: async ({ email, password }) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.success) {
            localStorage.setItem('vinis_auth_token', res.token);
            localStorage.setItem('vinis_user', JSON.stringify(res.user));
            window.dispatchEvent(new Event('auth_change'));
            return { data: { user: res.user, session: { access_token: res.token } }, error: null };
          }
          return { data: null, error: { message: res.error || 'Falha no login' } };
        } catch (e) {
          return { data: null, error: { message: e.message || 'Erro de conexão' } };
        }
      },
      signOut: async () => {
        localStorage.removeItem('vinis_auth_token');
        localStorage.removeItem('vinis_user');
        window.dispatchEvent(new Event('auth_change'));
        return { error: null };
      }
    };
  }

  from(table) {
    const builder = {
      _table: table,
      _filters: {},
      _limit: null,
      _order: null,
      _single: false,

      select: function(columns) { return this; },
      eq: function(column, value) { 
        this._filters[column] = value; 
        return this; 
      },
      or: function() { return this; },
      ilike: function() { return this; },
      order: function(col, { ascending } = {}) { 
        this._order = { col, ascending }; 
        return this; 
      },
      limit: function(n) { 
        this._limit = n; 
        return this; 
      },
      single: function() { 
        this._single = true; 
        return this; 
      },
      maybeSingle: function() { 
        this._single = true; 
        return this; 
      },

      // EXECUÇÃO (THEN/AWAIT)
      then: async (onSuccess, onError) => {
        try {
          let url = `/${this._table === 'usuarios' ? 'auth/me' : this._table}`;
          
          // Mapeamento especial para produtos e categorias (nossa rota é /api/products e /api/products/categories)
          if (this._table === 'produtos') url = '/products';
          if (this._table === 'categorias') url = '/products/categories';
          if (this._table === 'pedidos') url = '/orders/me';
          
          let response = await api.get(url);
          let data = response.data || [];

          // Filtro simples em memória para o Shim
          if (Object.keys(this._filters).length > 0) {
            data = data.filter(item => {
              return Object.entries(this._filters).every(([k, v]) => item[k] == v);
            });
          }

          if (this._single) data = data[0] || null;

          const result = { data, error: response.success ? null : { message: response.error } };
          return onSuccess ? onSuccess(result) : result;
        } catch (e) {
          const err = { data: null, error: { message: e.message } };
          return onError ? onError(err) : err;
        }
      },

      insert: async (dataArr) => {
        try {
          const data = Array.isArray(dataArr) ? dataArr[0] : dataArr;
          let url = `/${this._table}`;
          if (this._table === 'produtos') url = '/products';
          if (this._table === 'pedidos') url = '/orders';
          
          const res = await api.post(url, data);
          return { data: res.data, error: res.success ? null : { message: res.error } };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },

      update: async (data) => {
        try {
          // No supabaseLegado .update().eq('id', X) é comum
          const id = this._filters.id;
          let url = `/${this._table}/${id}`;
          if (this._table === 'produtos') url = `/products/${id}`;
          if (this._table === 'pedidos') url = `/orders/${id}`;
          
          const res = await api.put(url, data);
          return { data: res.data, error: res.success ? null : { message: res.error } };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },

      delete: async () => {
        try {
          const id = this._filters.id;
          let url = `/${this._table}/${id}`;
          const res = await api.delete(url);
          return { data: null, error: res.success ? null : { message: res.error } };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      }
    };

    // Vínculo do this para os métodos do builder
    builder.select = builder.select.bind(builder);
    builder.eq = builder.eq.bind(builder);
    builder.order = builder.order.bind(builder);
    builder.limit = builder.limit.bind(builder);
    builder.single = builder.single.bind(builder);
    builder.maybeSingle = builder.maybeSingle.bind(builder);

    return builder;
  }

  // Métodos de Canal (Real-time Dummy)
  channel() {
    return {
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({})
    };
  }
  removeChannel() {}
}

export const supabase = new SupabaseShim();
