# 🌭 Vini's Delivery — Industrial ERP & Multi-Channel Portal

O ERP do **Vini's Delivery** é uma plataforma de gestão de foodservice de alta performance, projetada para total paridade com sistemas líderes de mercado como **Anota AI** e integração nativa com o ecossistema **iFood**.

---

## 🚀 Novas Funcionalidades (v2.0 - Paridade Anota AI)

### 📊 Dashboard Financeiro Premium
- **KPIs em Tempo Real**: Faturamento bruto, ticket médio, total de pedidos e novos clientes.
- **Gráficos de Performance**: Visualização de fluxo de caixa e horários de pico via *Recharts*.
- **Tema Light Industrial**: Interface limpa, rápida e otimizada para Desktop e Mobile.

### 🥪 iFood Pro Sync
- **Polling Loop (30s)**: Sincronização automática de pedidos vindo do iFood diretamente para o Kanban local.
- **Auto-Acknowledgment**: O sistema confirma pedidos automaticamente para garantir que nenhum lead seja perdido.
- **Multi-Canal**: Gestão unificada (Portal Vini's + iFood) em uma única tela.

### 🛰️ Logística & Mapas (OpenStreetMap)
- **Monitoramento Geográfico**: Mapa interativo via *Leaflet* com geocodificação via *Nominatim*.
- **Roteirização**: Visualização de pedidos ativos em Taquara/RS para otimização de motoboys.
- **Taxas por Bairro**: Cálculo automático de entrega baseado na localização do cliente.

### 💳 Pagamentos & Fiscal
- **Integração Pagar.me (Stone)**: Suporte nativo a **PIX instantâneo** e Cartão de Crédito com conciliação automática via Webhook.
- **Módulo Fiscal (FocusNFE)**: Emissão automatizada de NFC-e após a confirmação de pagamento.
- **Contingência PIX**: Fluxo de upload de comprovantes para garantir vendas mesmo em quedas de API.

### 📦 Gestão de Estoque Híbrida
- **Leitor de Código de Barras**: Módulo de produtos compatível com scanners USB HID.
- **Ficha Técnica**: Baixa automática de insumos (pão, salsicha, etc) no momento da venda.
- **Auditoria**: Logs de todas as movimentações de entrada e saída.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React.js, Vite, TailwindCSS (Lite), Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MariaDB.
- **Real-time**: Socket.io (Monitor de Cozinha).
- **Integrations**: Pagar.me v5, iFood Merchant API, OpenStreetMap, FocusNFE.
- **Automation**: ViniBot (WhatsApp API).

---

## 🏗️ Arquitetura de Redirecionamento
Configuração de DNS para controle logístico:
- `api.hotdogdovini.com.br`: Endpoint Central de dados.
- `confirmacao.hotdogdovini.com.br`: Landing de sucesso após cadastro/pagamento.
- `redireciona.hotdogdovini.com.br`: Gateway de logística e mapas.

---

## 📦 Instalação & Desenvolvimento

```bash
# 1. Instalar dependências (Root & Backend)
npm install && npm run install:all

# 2. Configurar .env (backend/.env)
# DB_HOST, DB_USER, DB_PASS, DB_NAME
# PAGARME_SECRET_KEY, IFOOD_CLIENT_ID, IFOOD_CLIENT_SECRET
# OSM_CLIENT_ID, OSM_CLIENT_SECRET

# 3. Iniciar ambiente dev (Vite + Node)
npm run dev
```

© 2026 Vini's Delivery — Industrializando o sabor de Taquara/RS.
