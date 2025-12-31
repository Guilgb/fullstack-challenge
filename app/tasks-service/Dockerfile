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
COPY app/tasks-service/package*.json ./app/tasks-service/

RUN npm ci --workspace=tasks-service

# ================================
# Development Stage
# ================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/tasks-service/node_modules ./app/tasks-service/node_modules

COPY . .

WORKDIR /app/app/tasks-service

EXPOSE 3003

CMD ["npm", "run", "dev"]

# ================================
# Builder Stage
# ================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/tasks-service/node_modules ./app/tasks-service/node_modules

COPY . .

WORKDIR /app/app/tasks-service

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

COPY --from=builder /app/app/tasks-service/dist ./dist
COPY --from=builder /app/app/tasks-service/package*.json ./
COPY --from=builder /app/app/tasks-service/node_modules ./node_modules

USER nestjs

EXPOSE 3003

ENV NODE_ENV=production

CMD ["node", "dist/main"]
