FROM node:20-alpine
WORKDIR /app

# copy and install deps
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# copy app code
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]