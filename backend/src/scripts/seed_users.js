import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });

const seed = async () => {
  console.log('🌱 Iniciando semente de usuários...');

  try {
    const password = 'Ma596220@';
    const passwordHash = await bcrypt.hash(password, 10);

    const users = [
      {
        id: crypto.randomUUID(),
        email: 'viniamaral2026@gmail.com',
        password_hash: passwordHash,
        role: 'cliente'
      },
      {
        id: crypto.randomUUID(),
        email: 'admin@hotdogdovini.com.br',
        password_hash: passwordHash,
        role: 'admin'
      }
    ];

    for (const user of users) {
      // Verificar se já existe
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [user.email]);
      
      if (existing.length > 0) {
        console.log(`⚠️ Usuário ${user.email} já existe. Pulando...`);
        continue;
      }

      await db.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.id, user.email, user.password_hash, user.role]
      );
      console.log(`✅ Usuário ${user.email} criado com sucesso!`);
    }

    console.log('🚀 Seed finalizado com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
};

seed();
