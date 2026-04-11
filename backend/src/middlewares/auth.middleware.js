import jwt from 'jsonwebtoken';

/**
 * Autenticação JWT Customizada
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
    // Valida o token com o JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vini_super_secret_key_2026');

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Sessão inválida ou expirada' 
      });
    }

    // 🔐 TRAVA ZERO TRUST: Apenas o ADMIN acessa o ERP
    const ADMIN_EMAIL = 'admin@hotdogdovini.com.br';
    if (decoded.email !== ADMIN_EMAIL) {
      console.warn(`[Security Alert] Acesso negado para: ${decoded.email}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso restrito: Apenas o administrador principal pode acessar este módulo.' 
      });
    }

    // Injeção de Contexto para os Controllers
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    res.status(401).json({ success: false, error: 'Sessão inválida ou expirada' });
  }
}
