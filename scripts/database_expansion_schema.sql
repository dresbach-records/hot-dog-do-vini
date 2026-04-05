-- ========================================================
-- 🔥 VINI'S DELIVERY ERP - EXPANSÃO BACKEND (SUPER MIGRAÇÃO)
-- ========================================================

-- 1. MÓDULO DE LOGÍSTICA (MOTOBOYS)
CREATE TABLE IF NOT EXISTS public.motoboys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    telefone TEXT,
    tipo TEXT DEFAULT 'freelancer', -- 'freelancer' ou 'ifood'
    status TEXT DEFAULT 'disponivel', -- 'disponivel', 'em_entrega', 'offline'
    veiculo TEXT DEFAULT 'Moto',
    placa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Vincular motoboy ao pedido
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS motoboy_id UUID REFERENCES public.motoboys(id) ON DELETE SET NULL;

-- 2. MÓDULO DE GESTÃO DE ESTOQUE (INSUMOS)
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    categoria TEXT,
    quantidade NUMERIC(10,2) DEFAULT 0.00,
    minimo NUMERIC(10,2) DEFAULT 0.00,
    unidade TEXT DEFAULT 'UN', -- 'UN', 'KG', 'PCT', 'BAL'
    custo_unitario NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- FICHA TÉCNICA (Vínculo Produto -> Insumo)
CREATE TABLE IF NOT EXISTS public.ficha_tecnica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE CASCADE,
    quantidade_gasta NUMERIC(10,2) NOT NULL,
    UNIQUE(produto_id, insumo_id)
);

-- 3. MÓDULO DE MARKETING (CUPONS)
CREATE TABLE IF NOT EXISTS public.cupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL, -- Ex: 'SEXTOU'
    tipo TEXT DEFAULT 'fixo', -- 'fixo' ou 'porcentagem'
    valor NUMERIC(10,2) NOT NULL,
    validade_fim TIMESTAMP WITH TIME ZONE,
    minimo_pedido NUMERIC(10,2) DEFAULT 0.00,
    dia_semana INTEGER, -- 0 (Dom) a 6 (Sab)
    uso_maximo INTEGER DEFAULT 0, -- 0 = ilimitado
    uso_atual INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. MÓDULO DE AUTOMAÇÃO (VINI BOT & FISCAL)
CREATE TABLE IF NOT EXISTS public.bot_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL, -- 'vini_bot_settings'
    valor JSONB DEFAULT '{"active": true, "saudacao": "", "confirmacao": "", "entrega": ""}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.fiscal_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL, -- 'fiscal_settings'
    valor JSONB DEFAULT '{"active": false, "cnpj": "", "inscEstadual": "", "regime": "mei", "cscToken": ""}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. SEGURANÇA (RLS) PARA NOVAS TABELAS
ALTER TABLE public.motoboys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ficha_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_config ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS ADMIN (TOTAL PARA USUÁRIO AUTENTICADO)
CREATE POLICY "Admin total Motoboys" ON public.motoboys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total Insumos" ON public.insumos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total Ficha Tecnica" ON public.ficha_tecnica FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total Cupons" ON public.cupons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total Bot Config" ON public.bot_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total Fiscal Config" ON public.fiscal_config FOR ALL USING (auth.role() = 'authenticated');

-- ACESSO PÚBLICO (CUPONS PODEM SER SELECIONADOS NO CHECKOUT)
CREATE POLICY "Público ler Cupons" ON public.cupons FOR SELECT USING (ativo = true);

-- 6. TRIGGER DE ESTOQUE (BAIXA AUTOMÁTICA) - Exemplo Simples
-- Nota: Esta trigger reduz a quantidade em 'insumos' baseado na 'ficha_tecnica' ao concluir um pedido.
-- (Opcional: Podemos implementar via código no App ou via Stored Procedure)
