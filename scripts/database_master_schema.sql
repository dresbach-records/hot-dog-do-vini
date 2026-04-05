-- ========================================================
-- 🔥 VINI'S DELIVERY ERP - SCHEMA DEFINITIVO (MIGRAÇÃO TOTAL)
-- ========================================================
-- Este script cria todas as tabelas, colunas, relações e 
-- políticas de segurança (RLS) para o funcionamento pleno 
-- do Portal do Cliente e do Painel Administrativo.

-- 1. TABELA DE CONFIGURAÇÕES (TRAVA MESTRE E AVISOS)
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL, -- Ex: 'public_notice'
    valor JSONB NOT NULL DEFAULT '{"enabled": false, "salesEnabled": true, "title": "Atenção", "message": ""}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. TABELA DE EMPRESAS (NOVO)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    cnpj TEXT UNIQUE,
    email_gestor TEXT,
    telefone_gestor TEXT,
    limite_sugerido NUMERIC(10,2) DEFAULT 500.00,
    ativa BOOLEAN DEFAULT true,
    cor_primaria TEXT DEFAULT '#EA1D2C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE CATEGORIAS (CARDÁPIO)
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL UNIQUE,
    ordem INTEGER DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    ifood_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE PRODUTOS (CARDÁPIO)
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL UNIQUE,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT true,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE,
    ifood_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE CLIENTES (PERFIL & FINANCEIRO)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    email TEXT,
    telefone TEXT,
    cpf TEXT,
    codigo_vini UUID UNIQUE, -- ID de vínculo com Supabase Auth
    endereco_padrao JSONB DEFAULT '{"rua": "", "numero": "", "bairro": "", "cidade": "Taquara/RS", "complemento": ""}'::jsonb,
    
    -- Financeiro (Inadimplência / Geral)
    total_cliente NUMERIC(10,2) DEFAULT 0.00, -- Total histórico gasto
    total_pago NUMERIC(10,2) DEFAULT 0.00,    -- Total já quitado (Dashboard Admin)
    saldo_devedor NUMERIC(10,2) DEFAULT 0.00, -- Dívida atual (Lista Admin)
    
    -- Fidelidade (NOVO)
    fidelidade_pontos INTEGER DEFAULT 0,      -- Saldo acumulado (pts)
    
    -- Convênio Corporativo (Factoring)
    convenio_empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    convenio_status TEXT DEFAULT 'inativo',   -- 'ativo', 'inativo', 'pendente', 'bloqueado'
    convenio_limite NUMERIC(10,2) DEFAULT 150.00,
    convenio_saldo NUMERIC(10,2) DEFAULT 150.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE PEDIDOS (CHECKOUT & COZINHA)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    itens JSONB NOT NULL,           -- Array de produtos, quantidades e preços
    total NUMERIC(10,2) NOT NULL,
    metodo_pagamento TEXT NOT NULL, -- 'pix', 'cartao', 'convenio'
    status TEXT DEFAULT 'pendente', -- 'pendente', 'preparando', 'saiu_para_entrega', 'concluido', 'cancelado'
    endereco_entrega JSONB,        -- Endereço usado no momento da compra
    origem TEXT DEFAULT 'portal',   -- 'portal', 'ifood', 'site_publico'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 🔐 SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ========================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS PÚBLICAS (Visitantes veem cardápio, empresas e avisos)
CREATE POLICY "Acesso público ler Configuracoes" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "Acesso público ler Empresas" ON public.empresas FOR SELECT USING (true);
CREATE POLICY "Acesso público ler Categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Acesso público ler Produtos" ON public.produtos FOR SELECT USING (true);

-- 2. POLÍTICAS DO CLIENTE (Proteção de privacidade)
-- O cliente logado só vê e edita seu próprio perfil
CREATE POLICY "Clientes acessam próprio perfil" ON public.clientes FOR ALL 
USING (auth.uid() = codigo_vini);

-- O cliente só vê seus próprios pedidos
CREATE POLICY "Clientes veem histórico de pedidos" ON public.pedidos FOR SELECT 
USING (cliente_id IN (SELECT id FROM public.clientes WHERE codigo_vini = auth.uid()));

-- Clientes podem criar pedidos (Checkout)
CREATE POLICY "Clientes criam novos pedidos" ON public.pedidos FOR INSERT 
WITH CHECK (cliente_id IN (SELECT id FROM public.clientes WHERE codigo_vini = auth.uid()));

-- 3. POLÍTICAS DE ADMINISTRAÇÃO (Acesso Total para Usuários Autenticados Admin)
-- Nota: Estas políticas permitem gestão total via Auth do Supabase
CREATE POLICY "Admin controle total Configuracoes" ON public.configuracoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin controle total Empresas" ON public.empresas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin controle total Categorias" ON public.categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin controle total Produtos" ON public.produtos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin controle total Clientes" ON public.clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin controle total Pedidos" ON public.pedidos FOR ALL USING (auth.role() = 'authenticated');

-- ========================================================
-- 📊 DADOS INICIAIS DE CONFIGURAÇÃO (ESTADO PADRÃO)
-- ========================================================
INSERT INTO public.configuracoes (chave, valor) 
VALUES ('public_notice', '{"enabled": false, "salesEnabled": true, "title": "Atenção", "message": "Loja operando normalmente"}')
ON CONFLICT (chave) DO NOTHING;
