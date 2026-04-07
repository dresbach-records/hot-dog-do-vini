import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('f:/VINIS/backend/.env') });

const { Client } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: true
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Postgres. Running migrations...');

    const queries = [
      `ALTER TABLE public.clientes 
       ADD COLUMN IF NOT EXISTS individual_limit NUMERIC(10, 2),
       ADD COLUMN IF NOT EXISTS linked_account_id UUID REFERENCES public.clientes(id),
       ADD COLUMN IF NOT EXISTS joint_liability_group VARCHAR(100),
       ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(100);`,
      
      `ALTER TABLE public.pedidos
       ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(100),
       ADD COLUMN IF NOT EXISTS pago_em TIMESTAMP WITH TIME ZONE;`,

      `CREATE OR REPLACE FUNCTION public.atualiza_fiado()
       RETURNS trigger
       LANGUAGE plpgsql
      AS $function$
      DECLARE
        v_limit numeric;
        v_linked_id uuid;
        v_current_debt numeric;
        v_can_charge numeric;
        v_charge_self numeric;
        v_charge_linked numeric;
      BEGIN
        IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
           
           SELECT individual_limit, linked_account_id, saldo_devedor 
           INTO v_limit, v_linked_id, v_current_debt
           FROM public.clientes WHERE id = NEW.cliente_id;

           IF v_limit IS NOT NULL AND v_limit > 0 THEN
              v_can_charge := GREATEST(0, v_limit - v_current_debt);
              v_charge_self := LEAST(NEW.total, v_can_charge);
              v_charge_linked := NEW.total - v_charge_self;

              UPDATE public.clientes 
              SET saldo_devedor = saldo_devedor + v_charge_self,
                  total_cliente = total_cliente + v_charge_self
              WHERE id = NEW.cliente_id;

              IF v_charge_linked > 0 AND v_linked_id IS NOT NULL THEN
                 UPDATE public.clientes 
                 SET saldo_devedor = saldo_devedor + v_charge_linked,
                     total_cliente = total_cliente + v_charge_linked
                 WHERE id = v_linked_id;
              END IF;
           ELSE
              UPDATE public.clientes 
              SET saldo_devedor = saldo_devedor + NEW.total,
                  total_cliente = total_cliente + NEW.total
              WHERE id = NEW.cliente_id;
           END IF;
        END IF;

        IF NEW.status = 'cancelado' AND OLD.status = 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
           -- Reversão simples (pode ser refinada no futuro com colunas de split no pedido)
           UPDATE public.clientes 
           SET saldo_devedor = saldo_devedor - NEW.total,
               total_cliente = total_cliente - NEW.total
           WHERE id = NEW.cliente_id;
        END IF;

        RETURN NEW;
      END;
      $function$;`
    ];

    for (const query of queries) {
      await client.query(query);
      console.log('Executed:', query.substring(0, 50) + '...');
    }

    console.log('Migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
