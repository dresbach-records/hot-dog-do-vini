-- Índices de Performance - Vini's Delivery ERP
-- Executar no banco de dados MariaDB/MySQL

USE dresbach_vini_erp;

-- 1. Otimização de Pedidos
CREATE INDEX idx_pedidos_cliente_status ON pedidos(cliente_id, status);
CREATE INDEX idx_pedidos_data_criacao ON pedidos(created_at);
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);

-- 2. Otimização Financeira
CREATE INDEX idx_caixa_data_tipo ON caixa_movimentacoes(created_at, tipo);
CREATE INDEX idx_financeiro_pedido_id ON caixa_movimentacoes(pedido_id);

-- 3. Otimização de Estoque & Ficha Técnica
CREATE INDEX idx_produto_insumos_lookup ON produto_insumos(produto_id, insumo_id);
CREATE INDEX idx_estoque_mov_data ON estoque_movimentacoes(created_at);

-- 4. Otimização de Clientes (Busca por Telefone/Nome)
CREATE INDEX idx_clientes_nome_tel ON clientes(nome, telefone);
