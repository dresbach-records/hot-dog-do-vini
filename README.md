# 🌭 Vini's Delivery ERP & Marketing System - V2

Bem-vindo ao sistema de gestão e portal oficial do **Vini's Delivery**. Este projeto unifica o site institucional da marca com um ERP (Enterprise Resource Planning) completo para gestão de pedidos, fiados, fidelidade e marketing.

## 🚀 Novidades da Versão 2.0 (Integração Total)

Recentemente, o sistema passou por uma grande reformulação técnica para unificar a experiência do cliente com a gestão administrativa:

- **Site Institucional Integrado**: O site de marketing foi migrado para a raiz do ERP, permitindo que o cliente navegue e faça login no mesmo ambiente.
- **Portal do Cliente Robusto**: Uma área exclusiva para o cliente acompanhar seu status financeiro, extrato de fiados e progresso em programas de fidelidade.
- **Fluxo de Autenticação Inteligente**: Login diferenciado para administradores e clientes, com botões de retorno ao site e recuperação de senha por e-mail.
- **Proteção Anti-Quebra (Scope CSS)**: Estilos do site institucional isolados para garantir que os dashboards administrativos permaneçam intactos.
- **Auto-Provisionamento**: Clientes novos que se cadastram pelo site têm seus perfis de gestão criados automaticamente em tempo real.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js + Vite (Performance e HMR)
- **Estilização**: Tailwind CSS + CSS Scoped (para a Landing Page)
- **Backend/DB**: Supabase (Auth, Database e Storage)
- **Ícones**: Lucide React
- **Navegação**: React Router DOM (v6)

## 🏗️ Estrutura do Projeto

```bash
├── src/
│   ├── components/
│   │   ├── Site/          # Componentes da Landing Page (Hero, Menu, Footer...)
│   │   └── Layout/        # Componentes globais do ERP (Sidebar, Navbar...)
│   ├── context/
│   │   └── ClientesContext # Gerenciamento de estado global de clientes
│   ├── pages/
│   │   ├── PortalCliente.jsx # Área exclusiva do cliente
│   │   ├── Dashboard.jsx     # Painel Administrativo
│   │   └── LoginCliente.jsx  # Tela de acesso dedicada ao usuário final
│   └── lib/
│       └── supabaseClient.js # Configuração de conexão ao backend
└── public/ # Assets estáticos e imagens
```

## 🔐 Configuração de Segurança

O projeto utiliza variáveis de ambiente (`.env`) para proteger dados sensíveis. Certifique-se de configurar as seguintes chaves localmente (não enviadas ao GitHub por segurança):

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave pública para comunicação frontend.

## 📝 Primeiros Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/dresbach-records/hot-dog-do-vini.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---
*Vini's Delivery - Qualidade e Gestão em um só lugar.*
