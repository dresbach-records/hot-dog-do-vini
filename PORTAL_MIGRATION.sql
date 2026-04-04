-- =========================================================================
-- MIGRAÇÃO DE SUPORTE: PORTAL COMPLETO (CUPONS + ENDEREÇO + FIDELIDADE)
-- =========================================================================
-- Instrução: Cole este código no SQL Editor do seu Supabase.
-- =========================================================================

-- 1. TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS public.cupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    desconto_percentual NUMERIC(5, 2), -- Ex: 10.00 para 10%
    desconto_valor NUMERIC(10, 2), -- Ex: 5.00 para R$ 5,00
    ativo BOOLEAN DEFAULT TRUE,
    validade TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADICIONAR ENDEREÇO PADRÃO AO PERFIL DO CLIENTE
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS endereco_padrao JSONB;

-- 3. POLÍTICA DE FIDELIDADE (Visível ao Cliente)
-- A pontuação já usa 'total_cliente' da tabela clientes.
-- Recomenda-se criar uma view ou apenas usar o campo via código (App logic).

-- 4. RLS PARA CUPONS (Leitura Pública / Admin Total)
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer um vê cupons ativos" ON public.cupons
    FOR SELECT USING (ativo = TRUE AND (validade IS NULL OR validade > CURRENT_TIMESTAMP));

-- =========================================================================
-- DADOS INICIAIS DE TESTE (OPCIONAL)
-- =========================================================================
INSERT INTO public.cupons (codigo, desconto_valor, ativo) 
VALUES ('BEMVINDO5', 5.00, TRUE) 
ON CONFLICT (codigo) DO NOTHING;
