# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS backend-build
WORKDIR /app

COPY package*.json tsconfig.json vitest.config.ts ./
COPY prisma ./prisma
RUN npm ci
RUN npm run prisma:generate

COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    API_PORT=3333 \
    API_HOST=0.0.0.0 \
    FRONTEND_PORT=3000 \
    NEXT_HOST=0.0.0.0 \
    DATABASE_URL=file:./prisma/prisma/dev.db

COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY package*.json ./

COPY --from=frontend-build /app/frontend ./frontend

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN install -d /app/bootstrap && cp /app/prisma/prisma/dev.db /app/bootstrap/dev.db

VOLUME ["/app/prisma/prisma"]

EXPOSE 3333 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
