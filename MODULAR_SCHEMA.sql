-- =========================================================================
-- ESQUEMA DE BANCO DE DADOS MODULAR: VINI'S CONVÊNIOS (SaaS)
-- =========================================================================
-- Instrução: Cole este código no SQL Editor do seu Supabase para criar os módulos.
-- =========================================================================

-- Habilitando extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. MÓDULO: USUÁRIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Relacionamento com auth.users
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    cargo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. MÓDULO: EMPRESAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email_contato VARCHAR(255),
    limite_padrao_colaborador NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, inativo, inadimplente
    cor_primaria VARCHAR(7) DEFAULT '#EA1D2C', 
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. MÓDULO: CONVÊNIOS (Vínculos e Solicitações)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.convenios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    
    -- Status: pendente_gestor, pendente_empresa, ativo, rejeitado, bloqueado
    status VARCHAR(50) DEFAULT 'pendente_gestor',
    
    termo_aceito BOOLEAN DEFAULT FALSE,
    termo_versao VARCHAR(20) DEFAULT '1.0',
    ip_solicitacao VARCHAR(50),
    
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_usuario_empresa UNIQUE(usuario_id, empresa_id)
);

-- ==========================================
-- 4. MÓDULO: LIMITES DE CRÉDITO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.limites_credito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    convenio_id UUID REFERENCES public.convenios(id) ON DELETE CASCADE,
    
    limite_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    saldo_disponivel NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    dia_vencimento INT DEFAULT 5, -- Dia do mês para fechamento da fatura
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. MÓDULO: PEDIDOS (Checkout & Sacola)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    convenio_id UUID REFERENCES public.convenios(id) ON DELETE SET NULL, -- Se pago via convênio
    
    itens JSONB NOT NULL, -- Matriz de produtos: [{title, quantity, price, observations}]
    valor_total NUMERIC(10, 2) NOT NULL,
    taxa_entrega NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Opções: convenio, pix, cartao, dinheiro, va
    forma_pagamento VARCHAR(50),
    
    -- Status: pendente, preparando, entregue, cancelado
    status VARCHAR(50) DEFAULT 'pendente',
    
    endereco_entrega JSONB,
    observacoes_gerais TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. MÓDULO: TRANSAÇÕES (Débitos e Créditos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    convenio_id UUID REFERENCES public.convenios(id) ON DELETE CASCADE,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
    
    tipo VARCHAR(20), -- debito (compra), credito (pagamento/estorno)
    valor NUMERIC(10, 2) NOT NULL,
    
    saldo_anterior NUMERIC(10, 2),
    saldo_posterior NUMERIC(10, 2),
    
    descricao TEXT, -- Ex: "Compra Pedido #1234" ou "Pagamento de Fatura"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. MÓDULO: PAINEL GESTOR (Logs de Auditoria)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.logs_gestao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_auth_id UUID, -- Quem realizou a ação
    acao VARCHAR(255), -- Ex: "Aprovação de Convênio"
    entidade VARCHAR(50), -- "convenios", "empresas", "usuarios"
    entidade_id UUID,
    detalhes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. MÓDULO: PAINEL EMPRESA (Acessos RH)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.acessos_rh (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    auth_id UUID, -- User do RH no Supabase Auth
    nivel_permissao VARCHAR(50) DEFAULT 'leitura', -- leitura, aprovacao
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE SALDO
-- ==========================================

CREATE OR REPLACE FUNCTION atualiza_saldo_convenio()
RETURNS trigger AS $$
BEGIN
  -- Se o pedido for do tipo 'convenio' e estiver 'entregue'
  IF NEW.forma_pagamento = 'convenio' AND NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
     -- 1. Debitar do limite
     UPDATE public.limites_credito 
     SET saldo_disponivel = saldo_disponivel - NEW.valor_total,
         ultima_atualizacao = CURRENT_TIMESTAMP
     WHERE convenio_id = NEW.convenio_id;
     
     -- 2. Registrar Transação
     INSERT INTO public.transacoes (convenio_id, pedido_id, tipo, valor, descricao)
     VALUES (NEW.convenio_id, NEW.id, 'debito', NEW.valor_total, 'Compra via Convênio Corporativo');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualiza_saldo_convenio ON public.pedidos;
CREATE TRIGGER trg_atualiza_saldo_convenio
AFTER UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION atualiza_saldo_convenio();
