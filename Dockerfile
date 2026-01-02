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

FROM node:20-bookworm-slim AS backend-runner
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    API_PORT=3333 \
    API_HOST=0.0.0.0 \
    DATABASE_URL=file:./prisma/dev.db

COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/package*.json ./

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
    && install -d /app/bootstrap \
    && cp /app/prisma/prisma/dev.db /app/bootstrap/dev.db

VOLUME ["/app/prisma/prisma"]

EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]

FROM node:20-bookworm-slim AS frontend-runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    HOSTNAME=0.0.0.0

COPY --from=frontend-build /app/frontend ./

EXPOSE 3000

CMD ["npm", "run", "start"]
