-- ====== MÓDULO: WHATSAPP WEB + IA (VINI'S PRO - SAAS EDITION) ======
-- Instrução: Execute este SQL no editor do Supabase para habilitar o CRM Industrial.

-- 1. TABELA: CONTATOS
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    pushname VARCHAR(255),
    profile_pic_url TEXT,
    tags TEXT[],
    segmento VARCHAR(50) DEFAULT 'alimenticio', -- alimenticio, juridico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA: CONVERSAS
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
    account_id UUID, -- Isolamento Multi-tenant
    status VARCHAR(50) DEFAULT 'bot', -- bot, aberto, aguardando, finalizado
    prioridade VARCHAR(20) DEFAULT 'normal',
    assigned_to UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA: MENSAGENS (COM IDEMPOTÊNCIA E NORMALIZAÇÃO)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) UNIQUE, -- ID real do WhatsApp (Idempotência)
    sender VARCHAR(20) NOT NULL, -- user, agent, ai
    direction VARCHAR(10) DEFAULT 'IN', -- IN / OUT
    content TEXT,
    type VARCHAR(50) DEFAULT 'chat',
    delivered BOOLEAN DEFAULT FALSE,
    read BOOLEAN DEFAULT FALSE,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICE DE DUPLICIDADE (MUITO CRÍTICO PREVENIR DUPLICADOS)
CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_external ON public.whatsapp_messages(external_id);

-- 4. TABELA: TICKETS (SLA E GESTÃO)
CREATE TABLE IF NOT EXISTS public.whatsapp_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'open', -- open, pending, closed
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    assigned_to UUID,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA: LOGS DE IA (AUDITORIA E DEBUG)
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    input TEXT,
    output TEXT,
    model VARCHAR(50),
    tokens INTEGER,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS e Permissões Administrativas
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin All Access" ON public.whatsapp_contacts FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin All Access" ON public.whatsapp_conversations FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin All Access" ON public.whatsapp_messages FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin All Access" ON public.whatsapp_tickets FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin All Access" ON public.ai_logs FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
