-- =========================================================================
-- MÓDULO: CARDÁPIO DIGITAL (Categorias e Produtos)
-- =========================================================================

-- 1. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    ifood_id VARCHAR(100), -- ID de referência para importações
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT TRUE,
    ifood_id VARCHAR(100), -- ID de referência para importações
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HABILITAR RLS (Segurança)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Para o site/portal)
CREATE POLICY "Leitura pública de categorias" ON public.categorias FOR SELECT USING (ativa = TRUE);
CREATE POLICY "Leitura pública de produtos" ON public.produtos FOR SELECT USING (disponivel = TRUE);

-- Políticas de Admin (Inserção/Update/Delete)
-- Nota: Em produção, adicione check de role 'admin'
CREATE POLICY "Admin total categorias" ON public.categorias FOR ALL USING (true);
CREATE POLICY "Admin total produtos" ON public.produtos FOR ALL USING (true);
