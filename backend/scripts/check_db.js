import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('f:/VINIS/backend/.env') });

const client = new pg.Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTriggers() {
  try {
    await client.connect();
    // 1. List Functions
    const funcs = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'");
    console.log('Functions:', funcs.rows.map(r => r.routine_name));

    // 2. List Triggers
    const triggers = await client.query("SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_schema = 'public'");
    console.log('Triggers:', triggers.rows.map(r => `${r.trigger_name} on ${r.event_object_table}`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkTriggers();
