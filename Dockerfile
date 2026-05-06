# imagem base
FROM node:18-alpine

# diretório de trabalho
WORKDIR /app

# copiar dependências
COPY package*.json ./
RUN npm install --production

# copiar código
COPY . .

# porta da API
EXPOSE 3001

# comando
CMD ["node", "index.js"]