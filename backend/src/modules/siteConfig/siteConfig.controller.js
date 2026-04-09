import { pool } from '../../config/database.js';

export const getConfigs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT chave, valor FROM site_config');
    const configs = rows.reduce((acc, row) => {
      acc[row.chave] = row.valor;
      return acc;
    }, {});
    
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  const { configs } = req.body; // Expecting { key: value, ... }
  
  if (!configs || typeof configs !== 'object') {
    return res.status(400).json({ success: false, error: 'Configs invalid' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const [chave, valor] of Object.entries(configs)) {
      await connection.query(
        'INSERT INTO site_config (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        [chave, valor, valor]
      );
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};
