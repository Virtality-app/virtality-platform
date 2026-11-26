# Build from monorepo root (target the VPS arch — usually amd64):
#   docker build --platform linux/amd64 -f services/server/Dockerfile -t virtality-server:preview .
#
# Runtime requires LISTEN=true (and real secrets via Compose/env).

FROM node:24-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# Cut the monorepo down to the server and the workspace packages it imports,
# so a change that only touches the Next apps leaves the later layers cached.
FROM base AS pruner

COPY . .
RUN pnpm dlx turbo@2.8.11 prune @virtality/server --docker

FROM base AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Manifests and lockfile first: the install layer only rebuilds when they change.
COPY --from=pruner /app/out/json/ ./
COPY .pnpmfile.cjs ./
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ ./

# prisma generate reads this via prisma.config.ts; generate does not connect.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

RUN pnpm turbo run build --filter=@virtality/server
# Self-contained copy of the server with production deps only, so the runtime
# image does not carry the workspace or dev tooling.
RUN pnpm deploy --legacy --filter @virtality/server --prod /out

FROM node:24-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV LISTEN=true

WORKDIR /app

COPY --from=builder --chown=node:node /out ./

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --start-interval=2s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8080/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "dist/index.js"]
