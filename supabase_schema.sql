-- ====== BANCO DE DADOS: VINI'S DELIVERY (ERP + PORTAL CLIENTE + IFOOD) ======
-- Instrução: Cole este código na guia "SQL Editor" do seu Supabase e clique em "Run"

-- 1. Habilitando extensões (caso não existam)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABELA: CLIENTES
-- ==========================================
-- Vincula-se ao objeto user de autenticação via "codigo_vini" (que guarda o auth.uid())
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_vini UUID UNIQUE, -- Relacionamento com auth.users(id)
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cpf VARCHAR(14),
    empresa VARCHAR(100), -- Ex: "Cris du"
    
    -- Financeiro (Fiado e Fidelidade)
    total_cliente NUMERIC(10, 2) DEFAULT 0.00, -- Todo consumo histórico
    total_pago NUMERIC(10, 2) DEFAULT 0.00,
    saldo_devedor NUMERIC(10, 2) DEFAULT 0.00, -- Quanto está devendo hoje
    limite_credito NUMERIC(10, 2) DEFAULT 0.00,
    vencimento INT, -- Dia do mês de vencimento (ex: 5, 10, 15)
    
    -- Cadastro Premium / Integração (CRIS DU, etc)
    data_nascimento DATE,
    status_integracao VARCHAR(50) DEFAULT 'nenhuma', -- nenhuma, pendente, aprovada (legado/suporte)
    setor VARCHAR(100),

    -- Módulo Convênios (Novo Vini's Standard)
    convenio_status VARCHAR(50) DEFAULT 'nao_solicitado', -- nao_solicitado, pendente_gestor, pendente_empresa, ativo, rejeitado, bloqueado
    convenio_empresa_id UUID,
    convenio_termo_aceito BOOLEAN DEFAULT FALSE,
    convenio_termo_versao VARCHAR(20) DEFAULT '1.0',
    convenio_ip_registro VARCHAR(50),
    convenio_data_solicitacao TIMESTAMP WITH TIME ZONE,
    convenio_limite NUMERIC(10, 2) DEFAULT 0.00,
    convenio_saldo NUMERIC(10, 2) DEFAULT 0.00,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA: EMPRESAS_CONVENIO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.empresas_convenio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    limite_padrao NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, inativo, inadimplente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA: SOLICITACOES_CONVENIO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_convenio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas_convenio(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pendente_gestor',
    dados_funcionario JSONB NOT NULL, -- {nome, cpf, telefone}
    termo_versao VARCHAR(20) DEFAULT '1.0',
    ip_registro VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA: CONFIGURACOES_IFOOD
-- ==========================================
-- Armazena de forma segura as chaves e status de integrações (admin)
CREATE TABLE IF NOT EXISTS public.configuracoes_loja (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id VARCHAR(255),
    ifood_access_token TEXT,
    ifood_refresh_token TEXT,
    ifood_token_expires_at TIMESTAMP WITH TIME ZONE,
    status_loja VARCHAR(50) DEFAULT 'fechada', -- aberta, fechada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA: PEDIDOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL, -- Se For null, é Avulso
    codigo_pedido_curto VARCHAR(20), -- Ex: #4059, #IF-1234
    
    plataforma VARCHAR(50) DEFAULT 'vinis', -- vinis, ifood, anotaai, whatsapp
    id_externo VARCHAR(255) UNIQUE, -- ID do pedido no iFood/AnotaAi
    
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, confirmado, preparo, pronto, despachado, entregue, cancelado
    
    tipo_entrega VARCHAR(50) DEFAULT 'balcao', -- balcao, delivery_proprio, delivery_ifood, mesa
    endereco_entrega JSONB, -- Rua, Numero, Bairro, Compl
    
    forma_pagamento VARCHAR(50), -- pix, cartao_credito, dinheiro, fiado, ifood
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    taxa_entrega NUMERIC(10, 2) DEFAULT 0.00,
    
    agendado_para TIMESTAMP WITH TIME ZONE, -- Se existir, é pedido de agendamento (ex: Cris du)
    itens JSONB NOT NULL, -- Matriz/Vetor dos produtos [{nome, qtd, preco, obs}]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SEGURANÇA E RLS (Row Level Security)
-- ==========================================

-- Habilitando RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_convenio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_convenio ENABLE ROW LEVEL SECURITY;

-- 0. Políticas Públicas / Seleção Parcial
CREATE POLICY "Qualquer um vê empresas ativas" ON public.empresas_convenio
    FOR SELECT USING (status = 'ativo');

-- 1. Políticas Cliente:
-- Um cliente comum só pode ler/atualizar seu Próprio Perfil (usando "codigo_vini")
CREATE POLICY "Cliente ver seu próprio perfil" ON public.clientes
    FOR SELECT USING (codigo_vini = auth.uid());

-- Permitir que clientes atualizem seu próprio perfil (CPF, Telefone)
CREATE POLICY "Cliente atualizar seu próprio perfil" ON public.clientes
    FOR UPDATE USING (codigo_vini = auth.uid());

-- Um cliente só pode ver seus Próprios Pedidos
CREATE POLICY "Cliente ver seus pedidos" ON public.pedidos
    FOR SELECT USING (
        cliente_id IN (
            SELECT id FROM public.clientes WHERE codigo_vini = auth.uid()
        )
    );

-- 2. Políticas Admin:
-- Pega metadata do User Logado -> IF role = 'admin', pode TUDO
CREATE POLICY "Admin ler tudo em clientes" ON public.clientes
    FOR ALL USING (
         (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin ler tudo em pedidos" ON public.pedidos
    FOR ALL USING (
         (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "APENAS Admin vê iFood Configs" ON public.configuracoes_loja
    FOR ALL USING (
         (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 3. Políticas de Criação (INSERT):
-- Permitir que novos usuários se cadastrem na tabela clientes
CREATE POLICY "Qualquer autenticado cria seu perfil" ON public.clientes
    FOR INSERT WITH CHECK (true);

-- Permitir que clientes criem seus próprios pedidos
CREATE POLICY "Cliente criar seus próprios pedidos" ON public.pedidos
    FOR INSERT WITH CHECK (
        cliente_id IN (
            SELECT id FROM public.clientes WHERE codigo_vini = auth.uid()
        )
    );


-- ==========================================
-- AUTO UPDATE TRIGGERS E FUNCTIONS (FUNÇOES DO BANCO)
-- ==========================================

-- Função: Somar fiado toda vez que um pedido é Finalizado (Entregue) e Forma Pagamento = 'fiado'
CREATE OR REPLACE FUNCTION atualiza_fiado()
RETURNS trigger AS $$
BEGIN
  -- UPDATE de status de um pedido existente: passou para 'entregue' e foi via 'fiado'
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
     UPDATE public.clientes 
     SET saldo_devedor = saldo_devedor + NEW.total,
         total_cliente = total_cliente + NEW.total
     WHERE id = NEW.cliente_id;
  END IF;
  
  -- Se o pedido for Cancelado, e já tinha sido entregue (reversão)
  IF NEW.status = 'cancelado' AND OLD.status = 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
     UPDATE public.clientes 
     SET saldo_devedor = saldo_devedor - NEW.total,
         total_cliente = total_cliente - NEW.total
     WHERE id = NEW.cliente_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apaga se existir, depois Cria o Trigger no Pedido
DROP TRIGGER IF EXISTS trg_atualiza_fiado ON public.pedidos;
CREATE TRIGGER trg_atualiza_fiado
AFTER UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION atualiza_fiado();


-- ================== publicado no supabase ==================
