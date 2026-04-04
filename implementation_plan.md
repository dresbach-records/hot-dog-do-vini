# Sistema Vini Delivery - Fluxo Completo e Impressão iFood

Este plano detalha a implementação do fluxo completo de pedidos, integração com a API do iFood para pagamentos e a configuração da impressora térmica **GP iFood** no portal administrativo.

## User Review Required

> [!IMPORTANT]
> **Arquitetura de Backend:** O usuário solicitou a criação de uma pasta `backend` dentro do projeto Node.js que rodará junto com o frontend. Para Next.js na Vercel, o ideal é usar **API Routes** em `src/app/api`, mas seguiremos a instrução de criar uma pasta dedicada `backend/` para a lógica de integração (iFood/Impressora).

> [!WARNING]
> **Fluxo de Pagamento Pix/Card iFood:** Precisamos das credenciais da API do iFood (Client ID, Client Secret) para emitir cobranças e validar status de pagamento.

## Proposed Changes

### 1. Novo Módulo: Backend (Node.js) [NEW]
- Criar pasta `backend/` na raiz do projeto.
- Implementar servidomres em Node.js (ou API Routes) para:
  - Integração com iFood API (Pedidos e Pagamentos).
  - Webhooks para atualização de status de pagamento (Pix/Cartão).
  - Interface com o agente de impressão local `C:\Program Files (x86)\Impressora GP iFood`.

### 2. Frontend: Fluxo de Compra (Cliente)
- **Carrinho de Compras:** Implementar estado global para itens, descrição e total.
- **Checkout:** Formulário de endereço de entrega e seleção de pagamento.
- **Integração iFood:** Chamar backend para gerar Pix key ou processar cartão via gateway iFood.
- **Sucesso:** Tela de acompanhamento (Em Preparação).

### 3. Portal Administrativo (Gestor)
- **Confirmação Automática:** Pedidos pagos via API do iFood ou Chave Pix iFood serão marcados como "PAGO" automaticamente no banco de dados.
- **Dashboard Kanban:** Visualização de pedidos por status (Pendente -> Preparação -> Entrega).
- **Notificação:** Implementar sino (alerta sonoro) para novos pedidos confirmados.
- **Gestão:** Evolução manual de status no kanban.
- **Impressão (Passo Final):** O comando para a **Impressora GP iFood** deve ser a última ação após a evolução do pedido ou confirmação de pagamento, conforme solicitado.


### 4. Integração iFood Logística
- Ao evoluir o pedido no Kanban para "Entrega", o sistema deve chamar a API do iFood para solicitar o entregador.

## Open Questions

> [!CAUTION]
> 1. Você já possui as chaves de API do iFood Developer?
> 2. O portal de administração já existe ou devo criá-lo do zero nesta estrutura? (Atualmente vejo apenas o site do cliente).

## Verification Plan

### Manual Verification
- Realizar um pedido de teste no frontend.
- Verificar se a cobrança é gerada.
- No portal admin, confirmar se o alerta sonoro toca e se o botão "Imprimir" dispara a impressão na GP iFood.

