# 🌭 Vini's Delivery — ERP & PWA Portal (10/10)

Bem-vindo ao repositório oficial do sistema **Vini's Delivery**. Este projeto opera em uma arquitetura industrial de alta disponibilidade com banco de dados próprio (MariaDB/MySQL).

---

## 🚀 Arquitetura Geral (Self-Hosted)

O sistema segue o princípio de **"Confiança Zero"** no frontend. Toda a lógica crítica de negócios, cálculos de preços e validações de integridade são executadas exclusivamente no servidor (Backend), protegendo o sistema contra manipulações e fraudes.

### 🏗️ Estrutura de Pastas (Modular)

```text
/
├── backend/               # Servidor Node.js (Express) modularizado
│   ├── src/
│   │   ├── modules/       # Domínios de negócio (Orders, Products, Motoboys)
│   │   ├── config/        # Configurações de Banco (MariaDB) e Auth
│   │   ├── middlewares/   # Auth JWT, Rate Limit, Error Global
│   │   └── routes/        # Roteamento central /api
│   └── server.js          # Ponto de entrada (Porta 3001)
│
├── src/ (Frontend)        # Portal PWA em React + Vite
│   ├── services/          # api.js (Axios Centralizado)
│   ├── components/        # Componentes UI (Modular CSS)
│   └── pages/             # Fluxos de Dashboard, Gestão e Portal
│
└── .env                   # Chaves de Ambiente (Públicas)
```

---

## 🔐 Segurança & Resiliência

### ✅ Banco de Dados Independente
O sistema utiliza MariaDB local, eliminando dependências de terceiros como Supabase. Todas as consultas SQL são otimizadas via Pool de conexões.

### ✅ Barreira de Preço Autoritária
O backend **ignora** valores monetários vindos do frontend. Todo o total de pedido é recalculado consultando o banco de dados oficial.

### ✅ Autenticação JWT Customizada
Sistema robusto de autenticação e autorização via JSON Web Token, com diferenciação entre Admin e Clientes.

---

## 📡 Integrações & Proxy Seguro

- **iFood Merchant API**: Fluxo OAuth completo, sincronização de pedidos e status.
- **Asaas / PagSeguro**: Integração financeira para recebimentos automáticos.
- **ViniBot PRO**: Automação de WhatsApp integrada via Baileys e BullMQ.

---

## 💻 Desenvolvimento Local

### 1. Requisitos
- Node.js v18+
- MariaDB / MySQL Server
- Redis (para filas do Bot)

### 2. Configuração de Banco
Importe o arquivo `scripts/database_master_schema.sql` no seu servidor MariaDB.

### 3. Configuração de Ambiente (`.env`)
- **Backend (`backend/.env`)**:
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `JWT_SECRET`
  - `IFOOD_CLIENT_ID`, `IFOOD_CLIENT_SECRET`

### 4. Iniciar Servidores
```bash
npm install     # Instala dependências root
npm run dev     # Inicia Frontend (5173) e Backend (3001) simultaneamente
```

---

## 🚢 Deploy (Arquitetura VPS)

O deploy é otimizado para VPS (Ubuntu/Debian) usando:
1. **Nginx**: Como Proxy Reverso para o Backend e Servidor Estático para o Frontend.
2. **PM2**: Gerenciamento de processo para o servidor Node.js.
3. **SSL (Certbot)**: Encriptação TLS obrigatória.

---

## 📜 Licença
© 2026 Vini's Delivery — Todos os direitos reservados.
