# 🌭 Vini's Delivery ERP — Edição Industrial

O Vini's Delivery ERP é uma solução robusta e automatizada para gestão de delivery, agora expandida com uma integração de nível **Enterprise** com o iFood. O sistema foi projetado para alta escalabilidade, segurança e visibilidade total da operação.

## 🚀 iFood Command Center (Industrial)

A nova central de comando iFood oferece ferramentas avançadas para gestão de ponta a ponta:

### 1. Motor de Sincronização & Auditoria
- **Heartbeat Enterprise:** Processamento em segundo plano via **BullMQ (Redis)** que sincroniza eventos a cada 30 segundos.
- **Idempotência Log:** Registro rigoroso de cada evento na tabela `ifood_events_log` para evitar duplicidade e garantir integridade.
- **Webhook HMAC:** Validação de segurança SHA256 em todos os payloads recebidos do portal do parceiro.

### 2. Inteligência Financeira V3
- **Consolidação de Impacto:** Algoritmo que distingue automaticamente faturamentos **Com Impacto** (Online) de faturamentos **Sem Impacto** (Dinheiro/VA/VR recebidos na entrega).
- **Conciliação Direta:** Visibilidade total de comissões, vendas válidas e saldo líquido real a receber.

### 3. Logística V2 & Shipping
- **Rastreamento em Tempo Real:** Mapa de entregas integrado para pedidos iFood.
- **Shipping On-Demand:** Possibilidade de solicitar entregadores iFood diretamente para pedidos originados via WhatsApp ou balcão.
- **Verificação de PIN:** Suporte completo à verificação de código de entrega mandatório.

### 4. Gestão de Reputação V2
- Dashboard dedicado para leitura e resposta de avaliações.
- Filtros inteligentes e monitoramento da janela de 5 dias para respostas públicas.

### 5. Interação com iFood Widget
- Botão "balão" flutuante integrado nos portais Admin e Cliente.
- Chat em tempo real com suporte e clientes iFood.
- Rastreio nativo visível para o consumidor.

---

## 🏗️ Infraestrutura & Subdomínios

O ecossistema opera sobre um proxy reverso Nginx com múltiplos subdomínios:

- `erp.hotdogdovini.com.br`: Dashboard Administrativo.
- `webhook.hotdogdovini.com.br`: Ponto de entrada p/ eventos iFood.
- `api.hotdogdovini.com.br`: Backend Core.
- `checkout.hotdogdovini.com.br`: Gateway de pagamentos.
- `confirmacao.hotdogdovini.com.br`: Redirects de segurança.

## 🔐 Restrições de Homologação (Medida de Teste)

Durante a fase atual de homologação técnica (Abril/2026), o **Cardápio Online** e a **Sacola de Compras** no portal do cliente estão habilitados **exclusivamente** para o usuário de teste:
- **Email:** `viniamaral2026@gmail.com`

Demais usuários visualizarão uma tela de "Em Breve" até a liberação total do sistema.

---
Desenvolvido com ❤️ por Marcos Dresbach & **Antigravity**.
