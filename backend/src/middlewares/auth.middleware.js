import { supabase } from '../config/supabase.js';

/**
 * Autenticação JWT Supabase (Padrão 10/10)
 * Extrai o token do header 'Authorization: Bearer <token>'
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de autenticação não fornecido' 
    });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Formato de token inválido' 
    });
  }

  try {
    // Valida o token com o Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn(`[Auth] Sessão inválida ou expirada para o token enviado.`);
      return res.status(401).json({ 
        success: false, 
        error: 'Sessão inválida ou expirada' 
      });
    }

    // Injeção de Contexto para os Controllers
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    res.status(500).json({ success: false, error: 'Erro ao validar autenticação' });
  }
}
