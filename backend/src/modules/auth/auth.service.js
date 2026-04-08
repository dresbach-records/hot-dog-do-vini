import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../../config/database.js';
import crypto from 'crypto';

export const authService = {
  async register({ email, password, role = 'cliente', name = '' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    
    await query(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [id, email, passwordHash, role]
    );

    // Se for um cliente, cria o registro na tabela clientes também
    if (role === 'cliente') {
      await query(
        'INSERT INTO clientes (id, user_id, nome, email) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), id, name || email.split('@')[0], email]
      );
    }
    
    return { id, email, role };
  },

  async login({ email, password }) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      throw new Error('Usuário ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Usuário ou senha inválidos');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vini_super_secret_key_2026',
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  },

  async validateToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'vini_super_secret_key_2026'
      );
      return decoded;
    } catch (err) {
      throw new Error('Token inválido ou expirado');
    }
  }
};
