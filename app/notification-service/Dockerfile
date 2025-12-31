# ================================
# Base Stage
# ================================
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# ================================
# Dependencies Stage
# ================================
FROM base AS deps

COPY package*.json ./
COPY app/notification-service/package*.json ./app/notification-service/

RUN npm ci --workspace=notification-service

# ================================
# Development Stage
# ================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/notification-service/node_modules ./app/notification-service/node_modules

COPY . .

WORKDIR /app/app/notification-service

EXPOSE 3004

CMD ["npm", "run", "dev"]

# ================================
# Builder Stage
# ================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/notification-service/node_modules ./app/notification-service/node_modules

COPY . .

WORKDIR /app/app/notification-service

RUN npm run build

# ================================
# Production Stage
# ================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/app/notification-service/dist ./dist
COPY --from=builder /app/app/notification-service/package*.json ./
COPY --from=builder /app/app/notification-service/node_modules ./node_modules

USER nestjs

EXPOSE 3004

ENV NODE_ENV=production

CMD ["node", "dist/main"]
