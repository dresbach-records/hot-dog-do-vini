import { query } from './src/infrastructure/database.js';

async function checkMoreTables() {
  try {
    const contacts = await query('SELECT id, name FROM whatsapp_contacts');
    console.log('WhatsApp Contacts:', JSON.stringify(contacts, null, 2));

    const pedidos = await query('SELECT id, cliente_id, total, status FROM pedidos');
    console.log('Orders:', JSON.stringify(pedidos, null, 2));
  } catch (error) {
    console.error('Error checking DB:', error);
  }
}

checkMoreTables();
