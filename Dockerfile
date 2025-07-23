# Dockerfile
FROM node:16

WORKDIR /usr/src/app

# Copiar arquivos de dependências primeiro para aproveitar cache
COPY package*.json ./
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Expor a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/backend/server/server.js"]
