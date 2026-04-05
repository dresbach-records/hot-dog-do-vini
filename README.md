# 🌭 Vini's Delivery — ERP & PWA Portal (10/10)

Bem-vindo ao repositório oficial do sistema **Vini's Delivery**. Este projeto foi evoluído hoje para uma arquitetura industrial de alta disponibilidade, segurança e escalabilidade.

---

## 🚀 Arquitetura Geral (Zero Trust)

O sistema segue o princípio de **"Confiança Zero"** no frontend. Toda a lógica crítica de negócios, cálculos de preços e validações de integridade são executadas exclusivamente no servidor (Backend), protegendo o sistema contra manipulações e fraudes.

### 🏗️ Estrutura de Pastas (Modular)

```text
/
├── backend/               # Servidor Node.js (Express) modularizado
│   ├── src/
│   │   ├── modules/       # Domínios de negócio (Orders, Products, Integrations)
│   │   ├── config/        # Supabase Service Role & Env
│   │   ├── middlewares/   # Auth JWT, Rate Limit, Error Global
│   │   └── routes/        # Roteamento central /api
│   └── server.js          # Ponto de entrada (Porta 3001)
│
├── src/ (Frontend)        # Portal PWA em React + Vite
│   ├── services/          # api.js (Axios Centralizado)
│   ├── components/        # Componentes UI (Modular CSS)
│   └── pages/             # Fluxos de Checkout e Portal Cliente
│
└── .env                   # Chaves de Ambiente (Públicas)
```

---

## 🔐 Segurança & Resiliência (Padrão 10/10)

### ✅ Barreira de Preço Autoritária
O backend **ignora** valores monetários vindos do frontend. Todo o total de pedido é recalculado consultando o banco de dados oficial (Supabase) via `SERVICE_ROLE_KEY`.

### ✅ Idempotência Técnica
Proteção contra pedidos duplicados. O sistema valida cliques acidentais e evita múltiplos processamentos para o mesmo usuário em uma janela de 30 segundos.

### ✅ Validação de Esquema (Zod)
Todos os contratos de entrada (payloads) são validados rigidamente antes de qualquer processamento lógico.

### ✅ Tratamento Modular de Erros
Diferenciação clara entre:
- **Erro 400 (Zod)**: Feedback imediato ao front sobre dados inválidos.
- **Erro 500 (Server)**: Logging estruturado e supressão de stack traces em produção.

---

## 📡 Integrações & Proxy Seguro

- **iFood Merchant API**: Fluxo OAuth completo, sincronização de pedidos e status (confirm, dispatch, cancel) com logs estruturados.
- **PagSeguro**: Geração de pagamentos (Pix/Cartão) com conversão de centavos segura no backend.

---

## 💻 Desenvolvimento Local

### 1. Requisitos
- Node.js v18+
- Supabase projeto ativo (URL e Chaves `ANON` e `SERVICE_ROLE`)

### 2. Configuração de Ambiente (`.env`)
Certifique-se de ter os dois arquivos configurados:

- **Raiz (`.env`)**: Chaves `VITE_` públicas.
- **Backend (`backend/.env`)**: Chaves secretas (`SUPABASE_SERVICE_ROLE_KEY`, `IFOOD_CLIENT_SECRET`, etc.).

### 3. Iniciar Servidores
```bash
npm install     # Instala dependências root
npm run dev     # Inicia Frontend (5173) e Backend (3001) simultaneamente
```

---

## 🚢 Deploy (Padrão Sênior)

O deploy ideal utiliza o fluxo:
1. **Frontend**: Vercel (conectado via `VITE_API_URL`).
2. **Backend**: Railway / VPS (conectado ao Supabase Admin).

> [!CAUTION]
> **Atenção**: Nunca exponha a sua `SERVICE_ROLE_KEY` no frontend ou em commits git. Ela deve estar apenas em seu ambiente de servidor seguro.

---

## 📜 Licença
© 2026 Vini's Delivery — Todos os direitos reservados.
