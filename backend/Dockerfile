# Usar a imagem oficial Node.js 20 (Base Slim para menor volume)
FROM node:20-slim

# Instalar dependências necessárias para o Puppeteer (WhatsApp-web.js)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    curl \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências do projeto
RUN npm install --production

# Copiar o restante do código
COPY . .

# Criar pastas para persistência de dados e logs
RUN mkdir -p logs .wwebjs_auth .baileys_auth

# Expor a porta que a API utiliza
EXPOSE 3001

# Comando de inicialização usando PM2 dentro do container
CMD ["npm", "start"]
