# ================================
# Base Stage
# ================================
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules (bcrypt needs python, make, g++)
RUN apk add --no-cache libc6-compat python3 make g++

# ================================
# Dependencies Stage
# ================================
FROM base AS deps

COPY package*.json ./
COPY app/auth-service/package*.json ./app/auth-service/

RUN npm ci --workspace=auth-service

# ================================
# Development Stage
# ================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/auth-service/node_modules ./app/auth-service/node_modules

COPY . .

WORKDIR /app/app/auth-service

EXPOSE 3002

CMD ["npm", "run", "dev"]

# ================================
# Builder Stage
# ================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/auth-service/node_modules ./app/auth-service/node_modules

COPY . .

WORKDIR /app/app/auth-service

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

COPY --from=builder /app/app/auth-service/dist ./dist
COPY --from=builder /app/app/auth-service/package*.json ./
COPY --from=builder /app/app/auth-service/node_modules ./node_modules

USER nestjs

EXPOSE 3002

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
