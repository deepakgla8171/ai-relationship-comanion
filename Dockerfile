# Multi-stage Dockerfile for AI Relationship Companion
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package files
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install server and client dependencies
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY shared/ ./shared/
COPY server/ ./server/
COPY client/ ./client/

# Build client
RUN cd client && npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY shared/ ./shared/
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

RUN cd server && npm install --omit=dev

EXPOSE 5000

CMD ["node", "server/src/server.js"]
