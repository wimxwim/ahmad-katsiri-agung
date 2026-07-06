# Stage 1: Install dependencies
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libjemalloc2 postgresql16-client
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p migrations && chown nextjs:nodejs migrations
COPY --from=builder /app/src/lib/db/migrations ./migrations

COPY scripts/prod-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
