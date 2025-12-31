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
COPY app/web/package*.json ./app/web/

RUN npm ci --workspace=web

# ================================
# Development Stage
# ================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/web/node_modules ./app/web/node_modules

COPY . .

WORKDIR /app/app/web

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ================================
# Builder Stage
# ================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/web/node_modules ./app/web/node_modules

COPY . .

WORKDIR /app/app/web

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ================================
# Production Stage (with nginx)
# ================================
FROM nginx:alpine AS production

# Copy nginx configuration
COPY app/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/app/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
