FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY .env.example ./

EXPOSE 3002 9229

CMD ["node", "src/index.js"]
