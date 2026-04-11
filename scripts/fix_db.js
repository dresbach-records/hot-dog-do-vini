import { db } from '../backend/src/config/database.js';

async function fix() {
  console.log('🛠️ Stabilizing Database Schema...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        chave VARCHAR(100) PRIMARY KEY,
        valor TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table site_config ensured.');

    // Ensure initial configs exist
    await db.query(`
      INSERT IGNORE INTO site_config (chave, valor) VALUES 
      ('public_notice', '{"enabled": false, "salesEnabled": true, "title": "Atenção", "message": "Loja operando normalmente"}')
    `);
    console.log('✅ Initial site_config values seeded.');

    console.log('🚀 Database stabilization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error stabilizing database:', err);
    process.exit(1);
  }
}

fix();
