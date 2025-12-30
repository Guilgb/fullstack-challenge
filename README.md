# Fullstack Challenge - Sistema de Gerenciamento de Tarefas

Sistema completo de gerenciamento de tarefas com arquitetura de microsserviços, autenticação JWT, notificações em tempo real via WebSocket e comunicação assíncrona com RabbitMQ.

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Decisões Técnicas](#-decisões-técnicas-e-trade-offs)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Problemas Conhecidos](#-problemas-conhecidos-e-melhorias)
- [Tempo de Desenvolvimento](#-tempo-de-desenvolvimento)

---

## 🏗️ Arquitetura

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                      http://localhost:3000                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React + TypeScript + Vite + TailwindCSS + Shadcn/ui     │  │
│  │ - Autenticação (Login/Registro)                          │  │
│  │ - Boards e Tasks (CRUD)                                  │  │
│  │ - Notificações em Tempo Real (WebSocket)                │  │
│  │ - Estado Global (Zustand)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (NestJS)                          │
│                   http://localhost:3001                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Ponto único de entrada para todas as requisições      │  │
│  │ - Roteamento e Proxy para microsserviços                │  │
│  │ - Autenticação JWT (Guards)                              │  │
│  │ - WebSocket Gateway (Notificações)                       │  │
│  │ - Rate Limiting & CORS                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────┬─────────────────────┬─────────────────────┬─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────┐
│ Auth Service  │    │ Tasks Service │    │ Notification      │
│   :3002       │    │   :3003       │    │   Service :3004   │
│               │    │               │    │                   │
│ - Registro    │    │ - Boards CRUD │    │ - Event Listener  │
│ - Login       │    │ - Tasks CRUD  │    │ - RabbitMQ        │
│ - JWT Tokens  │    │ - Validações  │    │ - WebSocket Emit  │
│ - Bcrypt      │    │ - Autorização │    │ - Push Real-time  │
└───────┬───────┘    └───────┬───────┘    └─────────┬─────────┘
        │                    │                       │
        │                    │                       │
        └────────────┬───────┴───────────────────────┘
                     │             │
         ┌───────────▼──┐    ┌─────▼──────────┐
         │  PostgreSQL  │    │   RabbitMQ     │
         │   :5432      │    │   :5672/:15672 │
         │              │    │                │
         │ - Users      │    │ - task.created │
         │ - Boards     │    │ - task.updated │
         │ - Tasks      │    │ - task.deleted │
         └──────────────┘    └────────────────┘
```

### Fluxo de Dados

#### 1. Autenticação
```
User → Frontend → API Gateway → Auth Service → PostgreSQL
                       ↓
                   JWT Token
                       ↓
                   Frontend (localStorage)
```

#### 2. Operações CRUD de Tasks
```
User → Frontend → API Gateway (JWT Guard) → Tasks Service → PostgreSQL
                                                  ↓
                                            RabbitMQ (Event)
                                                  ↓
                                         Notification Service
                                                  ↓
                                    WebSocket (via API Gateway)
                                                  ↓
                                              Frontend
```

#### 3. Notificações em Tempo Real
```
Task Created/Updated/Deleted → RabbitMQ → Notification Service
                                               ↓
                                    WebSocket Gateway (API Gateway)
                                               ↓
                                      Frontend (Real-time Update)
```

---

## 🔧 Decisões Técnicas e Trade-offs

### 1. **Arquitetura de Microsserviços**

**Decisão:** Separar a aplicação em microsserviços independentes (Auth, Tasks, Notifications).

**Por quê:**
- ✅ **Vantagens:**
  - Separação de responsabilidades e melhor organização do código
  - Escalabilidade independente de cada serviço
  - Facilita manutenção e deploy de partes específicas
  - Times podem trabalhar em serviços diferentes simultaneamente

- ❌ **Trade-offs:**
  - Maior complexidade inicial de setup
  - Mais overhead de comunicação entre serviços
  - Debugging distribuído mais complexo
  - Necessidade de orquestração (Docker Compose)

**Alternativa considerada:** Monolito modular - seria mais simples, mas menos escalável.

### 2. **API Gateway Pattern**

**Decisão:** Usar um API Gateway como ponto único de entrada.

**Por quê:**
- ✅ **Vantagens:**
  - Centralização de autenticação e autorização
  - Simplifica o cliente (frontend só precisa conhecer um endpoint)
  - Facilita implementação de cross-cutting concerns (CORS, Rate Limiting, Logging)
  - Abstrai a complexidade da arquitetura de microsserviços

- ❌ **Trade-offs:**
  - Ponto único de falha (se o gateway cair, nada funciona)
  - Pode se tornar um gargalo de performance
  - Mais uma camada de latência

**Alternativa considerada:** Client-side service discovery - mais complexo no frontend.

### 3. **RabbitMQ para Comunicação Assíncrona**

**Decisão:** Usar RabbitMQ para eventos de tasks (created/updated/deleted).

**Por quê:**
- ✅ **Vantagens:**
  - Desacoplamento entre serviços (Tasks não precisa conhecer Notifications)
  - Garantia de entrega de mensagens
  - Retry automático em caso de falha
  - Permite adicionar novos consumidores facilmente

- ❌ **Trade-offs:**
  - Dependência externa adicional
  - Complexidade de configuração e monitoramento
  - Possível latência nas notificações

**Alternativa considerada:** HTTP direto entre serviços - mais simples, mas acoplado e sem garantias.

### 4. **WebSocket para Notificações em Tempo Real**

**Decisão:** Implementar WebSocket para push de notificações ao frontend.

**Por quê:**
- ✅ **Vantagens:**
  - Atualizações em tempo real sem polling
  - Melhor experiência do usuário
  - Menos overhead de rede comparado a polling

- ❌ **Trade-offs:**
  - Conexões persistentes consomem mais recursos do servidor
  - Complexidade de gerenciamento de conexões
  - Necessidade de reconexão automática

**Alternativa considerada:** Server-Sent Events (SSE) - unidirecional, mais simples, mas menos flexível.

### 5. **PostgreSQL como Banco de Dados**

**Decisão:** Usar PostgreSQL para todos os serviços.

**Por quê:**
- ✅ **Vantagens:**
  - ACID compliance (transações confiáveis)
  - Ótimo para dados relacionais (Users → Boards → Tasks)
  - Robusto e maduro
  - Excelente suporte a JSON quando necessário

- ❌ **Trade-offs:**
  - Menos flexível que NoSQL para schemas dinâmicos
  - Escalabilidade horizontal mais complexa

**Alternativa considerada:** MongoDB - mais flexível, mas menos garantias transacionais.

### 6. **Monorepo com Turborepo**

**Decisão:** Usar estrutura de monorepo com Turborepo.

**Por quê:**
- ✅ **Vantagens:**
  - Compartilhamento fácil de código comum (types, utils, configs)
  - Build e cache inteligente
  - Comandos unificados para todos os serviços
  - Versionamento sincronizado

- ❌ **Trade-offs:**
  - Repositório maior
  - Potencial de conflitos em package.json
  - Tempo de CI/CD maior se não configurado corretamente

**Alternativa considerada:** Repos separados - mais isolamento, mas mais duplicação.

### 7. **JWT para Autenticação**

**Decisão:** Usar JWT (JSON Web Tokens) para autenticação stateless.

**Por quê:**
- ✅ **Vantagens:**
  - Stateless (não precisa armazenar sessões no servidor)
  - Facilita escalabilidade horizontal
  - Pode conter claims customizados
  - Funciona bem em arquitetura distribuída

- ❌ **Trade-offs:**
  - Não pode ser revogado facilmente (até expirar)
  - Token pode ficar grande com muitos claims
  - Vulnerável se não armazenado corretamente

**Alternativa considerada:** Sessions com Redis - mais controle, mas stateful.

### 8. **React com TypeScript e Vite**

**Decisão:** Usar React + TypeScript + Vite no frontend.

**Por quê:**
- ✅ **Vantagens:**
  - Vite oferece HMR ultra-rápido
  - TypeScript adiciona type safety
  - React tem ecossistema maduro
  - Shadcn/ui para componentes consistentes

- ❌ **Trade-offs:**
  - Build time adicional para transpilação

**Alternativa considerada:** Next.js - mais features (SSR), mas mais pesado para este caso.

### 9. **Docker e Docker Compose**

**Decisão:** Containerizar todos os serviços com Docker.

**Por quê:**
- ✅ **Vantagens:**
  - Ambiente consistente entre desenvolvimento e produção
  - Fácil onboarding de novos desenvolvedores
  - Orquestração simples com docker-compose
  - Isolamento de dependências

- ❌ **Trade-offs:**
  - Overhead de recursos (CPU/memória)
  - Debugging pode ser mais complexo

**Alternativa considerada:** Instalação local - mais simples, mas inconsistente entre ambientes.

### 10. **Zustand para State Management**

**Decisão:** Usar Zustand ao invés de Redux/Context API.

**Por quê:**
- ✅ **Vantagens:**
  - API minimalista e simples
  - Menos boilerplate que Redux
  - Performance excelente
  - TypeScript first

- ❌ **Trade-offs:**
  - Menos features que Redux (sem DevTools nativos)
  - Comunidade menor

**Alternativa considerada:** Redux Toolkit - mais poderoso, mas mais complexo.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js robusto e modular
- **TypeScript** - Type safety e melhor DX
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno para TypeScript/Node.js
- **RabbitMQ** - Message broker para comunicação assíncrona
- **JWT** - Autenticação stateless
- **Bcrypt** - Hash de senhas
- **WebSocket** (Socket.io) - Comunicação real-time
- **Class Validator** - Validação de DTOs
- **Passport** - Estratégias de autenticação

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server rápido
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Componentes acessíveis e customizáveis
- **React Router** - Roteamento
- **Zustand** - State management
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### DevOps & Ferramentas
- **Docker & Docker Compose** - Containerização
- **Turborepo** - Monorepo build system
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Vitest** - Testing para Vite

---

## ✨ Funcionalidades

### Autenticação
- ✅ Registro de novos usuários
- ✅ Login com email e senha
- ✅ JWT tokens com refresh
- ✅ Proteção de rotas (guards)
- ✅ Hash de senhas com bcrypt

### Boards (Quadros)
- ✅ Criar boards
- ✅ Listar boards do usuário
- ✅ Visualizar board específico
- ✅ Atualizar board
- ✅ Deletar board
- ✅ Autorização (apenas dono pode modificar)

### Tasks (Tarefas)
- ✅ Criar tasks em um board
- ✅ Listar tasks de um board
- ✅ Visualizar detalhes da task
- ✅ Atualizar task (título, descrição, status)
- ✅ Deletar task
- ✅ Status: TODO, IN_PROGRESS, DONE
- ✅ Validações (task deve pertencer a board do usuário)

### Notificações em Tempo Real
- ✅ Notificação quando task é criada
- ✅ Notificação quando task é atualizada
- ✅ Notificação quando task é deletada
- ✅ WebSocket connection automática
- ✅ Reconexão automática em caso de queda
- ✅ Toast notifications no frontend

### Extras
- ✅ Health checks em todos os serviços
- ✅ Logging estruturado
- ✅ CORS configurado
- ✅ Validação de dados (DTOs)
- ✅ Error handling centralizado
- ✅ Responsive design

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** >= 18
- **Docker** e **Docker Compose**
- **npm** >= 10.8.2

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd fullstack-challenge
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Cada serviço precisa de um arquivo `.env`. Exemplos:

   **app/auth-service/.env**
   ```env
   DATABASE_URL="postgresql://postgres:password@db:5432/challenge_db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRATION="1h"
   RABBITMQ_URL="amqp://admin:admin@rabbitmq:5672"
   PORT=3002
   ```

   **app/tasks-service/.env**
   ```env
   DATABASE_URL="postgresql://postgres:password@db:5432/challenge_db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   RABBITMQ_URL="amqp://admin:admin@rabbitmq:5672"
   PORT=3003
   ```

   **app/notification-service/.env**
   ```env
   RABBITMQ_URL="amqp://admin:admin@rabbitmq:5672"
   API_GATEWAY_URL="http://api-gateway:3001"
   PORT=3004
   ```

   **app/api-gateway/.env**
   ```env
   AUTH_SERVICE_URL="http://auth-service:3002"
   TASKS_SERVICE_URL="http://tasks-service:3003"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=3001
   ```

   **app/web/.env**
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_WS_URL=http://localhost:3001
   ```

### Execução com Docker (Recomendado)

1. **Inicie todos os serviços**
   ```bash
   docker-compose up --build
   ```

2. **Execute as migrations do Prisma**

   Em outro terminal:
   ```bash
   # Auth Service
   docker exec -it auth-service npx prisma migrate dev
   docker exec -it auth-service npx prisma generate

   # Tasks Service
   docker exec -it tasks-service npx prisma migrate dev
   docker exec -it tasks-service npx prisma generate
   ```

3. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3001
   - RabbitMQ Management: http://localhost:15672 (admin/admin)

### Execução Local (Desenvolvimento)

1. **Inicie apenas PostgreSQL e RabbitMQ**
   ```bash
   docker-compose up db rabbitmq
   ```

2. **Execute as migrations**
   ```bash
   cd app/auth-service && npx prisma migrate dev && npx prisma generate
   cd ../tasks-service && npx prisma migrate dev && npx prisma generate
   ```

3. **Inicie os serviços (em terminais separados ou use Turborepo)**
   ```bash
   # Opção 1: Todos juntos com Turborepo
   npm run dev

   # Opção 2: Individualmente
   npm run dev:api-gateway
   npm run dev:auth-service
   npm run dev:tasks-service
   npm run dev:notification-service
   npm run dev:web
   ```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                      # Inicia todos os serviços
npm run dev:web                  # Apenas frontend
npm run dev:api-gateway          # Apenas API Gateway
npm run dev:services             # Apenas backend services

# Build
npm run build                    # Build de todos os projetos

# Testes
npm run test                     # Roda todos os testes
npm run test:cov                 # Testes com coverage
npm run test:e2e                 # Testes end-to-end

# Produção
npm run start:prod               # Inicia em modo produção

# Linting e Formatação
npm run lint                     # Verifica código
npm run format                   # Formata código

# Limpeza
npm run clean                    # Remove node_modules e build
```

### Acessos e Credenciais Padrão

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| API Gateway | http://localhost:3001 | - |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| PostgreSQL | localhost:5432 | postgres / password |

---

## ⚠️ Problemas Conhecidos e Melhorias

### Problemas Conhecidos

1. **Falta de Refresh Token Rotation**
   - Atualmente, o refresh token não tem rotação automática
   - Risco de segurança se o token for comprometido
   - **Solução:** Implementar refresh token rotation e armazenar tokens revogados

2. **Sem Rate Limiting Efetivo**
   - API Gateway não tem rate limiting configurado
   - Vulnerável a ataques de força bruta
   - **Solução:** Implementar @nestjs/throttler ou usar Redis

3. **Falta de Logging Centralizado**
   - Logs estão espalhados pelos serviços
   - Difícil debugging em produção
   - **Solução:** Implementar ELK Stack ou similar (Elasticsearch, Logstash, Kibana)

4. **Sem Monitoramento de Health**
   - Não há alertas quando serviços caem
   - **Solução:** Implementar Prometheus + Grafana para métricas e alertas

5. **Testes Incompletos**
   - Coverage de testes é baixo
   - Faltam testes de integração entre serviços
   - **Solução:** Aumentar coverage para pelo menos 80%

6. **Falta de CI/CD**
   - Deploy manual é propenso a erros
   - **Solução:** Configurar GitHub Actions ou GitLab CI

7. **WebSocket Não Escala Horizontalmente**
   - Com múltiplas instâncias do API Gateway, WebSocket quebra
   - **Solução:** Usar Redis Adapter para Socket.io

8. **Sem Backup Automático do Banco**
   - Risco de perda de dados
   - **Solução:** Configurar pg_dump automático ou usar serviço gerenciado

### Melhorias Futuras

#### 🔒 Segurança
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar HTTPS em produção
- [ ] Implementar CSP (Content Security Policy)
- [ ] Adicionar helmet.js para headers de segurança
- [ ] Rate limiting por usuário e IP
- [ ] Validação de CSRF tokens
- [ ] Audit logs de ações sensíveis

#### 🚀 Performance
- [ ] Implementar cache com Redis (usuário, boards, tasks)
- [ ] Adicionar CDN para assets estáticos
- [ ] Lazy loading de componentes no frontend
- [ ] Database indexing otimizado
- [ ] Query optimization (N+1 problems)
- [ ] Implementar pagination em todas as listagens
- [ ] Compression de respostas (gzip)

#### 🧪 Testes
- [ ] Aumentar coverage para 80%+
- [ ] Testes E2E com Playwright ou Cypress
- [ ] Testes de carga (K6 ou Artillery)
- [ ] Testes de contrato entre serviços (Pact)
- [ ] Mutation testing
- [ ] Visual regression testing

#### 📊 Observabilidade
- [ ] Implementar Prometheus + Grafana
- [ ] Distributed tracing (Jaeger ou Zipkin)
- [ ] APM (Application Performance Monitoring)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (ELK Stack)
- [ ] Dashboards de métricas de negócio

#### 💼 Features de Negócio
- [ ] Compartilhamento de boards entre usuários
- [ ] Permissões granulares (owner, editor, viewer)
- [ ] Comentários em tasks
- [ ] Anexos em tasks
- [ ] Tags/labels para tasks
- [ ] Filtros e busca avançada
- [ ] Atividade/timeline de alterações
- [ ] Notificações por email
- [ ] Dark mode
- [ ] Internacionalização (i18n)

#### 🏗️ Arquitetura
- [ ] Event Sourcing para auditoria completa
- [ ] CQRS para separar reads e writes
- [ ] API Gateway com Kong ou Traefik
- [ ] Service mesh (Istio) para microservices
- [ ] Migrar para Kubernetes em produção
- [ ] Implementar Circuit Breaker (resilience4j)
- [ ] Dead Letter Queue para mensagens falhadas

#### 👨‍💻 Developer Experience
- [ ] Documentação automática com Swagger/OpenAPI
- [ ] Storybook para componentes do frontend
- [ ] Husky para pre-commit hooks
- [ ] Conventional commits enforcement
- [ ] Auto-changelog generation
- [ ] VSCode workspace settings
- [ ] Devcontainer configuration

#### 🔄 DevOps
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automatizado (Vercel + Railway/Heroku)
- [ ] Blue-Green deployment
- [ ] Canary releases
- [ ] Rollback automático em caso de falha
- [ ] Infrastructure as Code (Terraform)
- [ ] Secrets management (Vault)

---

## ⏱️ Tempo de Desenvolvimento

### Resumo Total: ~40-45 horas

| Fase | Tempo Estimado | Descrição |
|------|----------------|-----------|
| **Planejamento e Arquitetura** | 3-4h | Definição da arquitetura, escolha de tecnologias, diagramas |
| **Setup Inicial** | 2-3h | Configuração monorepo, Docker, Turborepo, estrutura de pastas |
| **Auth Service** | 5-6h | Implementação completa: registro, login, JWT, Prisma schema, validações |
| **Tasks Service** | 6-7h | CRUD de boards e tasks, integração com RabbitMQ, validações, autorização |
| **Notification Service** | 3-4h | Consumer RabbitMQ, lógica de notificações |
| **API Gateway** | 5-6h | Proxy, autenticação, WebSocket gateway, guards, roteamento |
| **Frontend - Setup e Estrutura** | 3h | Setup Vite, TailwindCSS, Shadcn/ui, estrutura de pastas, routing |
| **Frontend - Autenticação** | 2-3h | Páginas de login/registro, context, guards, localStorage |
| **Frontend - Boards** | 2-3h | Listagem, criação, edição, deleção de boards |
| **Frontend - Tasks** | 3-4h | CRUD completo, drag-and-drop (se implementado), visualizações |
| **Frontend - Notificações** | 2-3h | WebSocket client, toast notifications, componente de notificações |
| **Testes** | 3-4h | Testes unitários e de integração (cobertura parcial) |
| **Docker e Orquestração** | 2h | Dockerfiles, docker-compose, otimizações |
| **Documentação** | 2-3h | README, comentários no código, exemplos |
| **Debugging e Refinamentos** | 3-4h | Correção de bugs, melhorias de UX, polish |

### Breakdown Detalhado

#### Backend (~25-30h)

**Auth Service (5-6h)**
- Schema Prisma (User) - 0.5h
- Endpoints de registro/login - 2h
- JWT strategy e guards - 1.5h
- Validações e DTOs - 1h
- Testes - 1h

**Tasks Service (6-7h)**
- Schema Prisma (Board, Task) - 1h
- CRUD Boards - 2h
- CRUD Tasks - 2h
- RabbitMQ publisher - 1h
- Validações e autorização - 1h
- Testes - 1h

**Notification Service (3-4h)**
- Setup RabbitMQ consumer - 1h
- Lógica de processamento - 1h
- Integração com API Gateway - 1h
- Testes - 1h

**API Gateway (5-6h)**
- Setup e configuração - 1h
- Proxy e roteamento - 2h
- WebSocket gateway - 2h
- Guards e middlewares - 1h
- Testes - 1h

**Infraestrutura (4-5h)**
- Docker e docker-compose - 2h
- Configuração PostgreSQL/RabbitMQ - 1h
- Turborepo e scripts - 1h
- Variáveis de ambiente - 0.5h
- Troubleshooting - 0.5h

#### Frontend (~12-15h)

**Setup (3h)**
- Vite, TypeScript, TailwindCSS - 1h
- Shadcn/ui components - 1h
- Routing e estrutura - 1h

**Features (7-9h)**
- Auth pages e context - 2-3h
- Boards (CRUD completo) - 2-3h
- Tasks (CRUD completo) - 3-4h

**Real-time (2-3h)**
- WebSocket client - 1h
- Notificações toast - 1h
- Reconexão e error handling - 0.5h
- Integração com stores - 0.5h

**Extras (2-3h)**
- Responsividade - 1h
- Loading states - 0.5h
- Error handling - 0.5h
- Polish e UX - 1h

#### Documentação e Testes (5-7h)
- Documentação README - 2-3h
- Comentários no código - 1h
- Testes unitários - 2h
- Testes E2E - 1h

---

## 📝 Instruções Específicas

### Desenvolvimento Local vs Docker

**Use Docker quando:**
- Onboarding de novos desenvolvedores
- Quer ambiente 100% consistente
- Não quer instalar PostgreSQL/RabbitMQ localmente
- Está testando deploy/produção

**Use desenvolvimento local quando:**
- Debugging profundo (breakpoints, etc.)
- Hot reload mais rápido
- Menos overhead de recursos
- Quer usar ferramentas locais (Prisma Studio, etc.)

### Troubleshooting Comum

#### 1. Erro de conexão com o banco de dados

```bash
# Verifique se o PostgreSQL está rodando
docker ps | grep db

# Verifique os logs
docker logs db

# Recrie o container se necessário
docker-compose down -v
docker-compose up db
```

#### 2. RabbitMQ não conecta

```bash
# Verifique se RabbitMQ está pronto
docker logs rabbitmq

# Acesse o management
open http://localhost:15672

# Espere até ver "Server startup complete"
```

#### 3. WebSocket não conecta

- Verifique se o API Gateway está rodando
- Verifique CORS no API Gateway
- Verifique se a URL do WebSocket está correta no frontend (.env)
- Abra DevTools Network tab e procure por "websocket" ou "socket.io"

#### 4. Frontend não carrega dados

```bash
# Verifique variáveis de ambiente
cat app/web/.env

# Deve ter:
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001

# Reinicie o frontend após mudar .env
```

#### 5. Migrations falham

```bash
# Reset completo do banco (CUIDADO: apaga dados)
cd app/auth-service
npx prisma migrate reset

cd ../tasks-service
npx prisma migrate reset

# Ou apenas rode as migrations
npx prisma migrate dev
```

### Dicas de Desenvolvimento

1. **Use o Turborepo para velocidade**
   ```bash
   # Turborepo cacheia builds, use sempre
   npm run dev  # Inicia tudo com cache
   ```

2. **Prisma Studio para visualizar dados**
   ```bash
   cd app/auth-service
   npx prisma studio
   # Abre em localhost:5555
   ```

3. **RabbitMQ Management para debug**
   - Acesse: http://localhost:15672
   - Veja filas, mensagens, consumers
   - Útil para debug de notificações

4. **Logs estruturados**
   ```bash
   # Veja logs de um serviço específico
   docker logs -f api-gateway
   docker logs -f tasks-service
   ```

5. **Hot reload funciona**
   - Mudanças em código são refletidas automaticamente
   - Exceto: mudanças em .env (precisa restart)

---

## 📄 Licença

Este projeto foi desenvolvido como um desafio técnico e está disponível para fins educacionais.

---

## 👤 Autor

Desenvolvido com ❤️ como parte de um desafio fullstack.

---

## 🙏 Agradecimentos

- NestJS pela excelente arquitetura
- Shadcn/ui pelos componentes lindos
- Turborepo por tornar monorepos gerenciáveis
- Comunidade open-source por todas as bibliotecas incríveis

---

**📫 Dúvidas?** Abra uma issue ou entre em contato!
