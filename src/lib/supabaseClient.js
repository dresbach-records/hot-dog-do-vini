import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO SUPABASE: Chaves não encontradas no meta.env!');
  console.debug('Debug - URL:', supabaseUrl ? 'Presente' : 'Ausente');
  console.debug('Debug - Key:', supabaseAnonKey ? 'Presente' : 'Ausente');
}

export const supabase = createClient(
  supabaseUrl || 'https://fallback-url.supabase.co',
  supabaseAnonKey || 'fallback-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
