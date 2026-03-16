# ============================================================
# Stage 1: Build — compile TS, generate Prisma, obfuscate JS
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client + compile TypeScript + obfuscate
RUN npx prisma generate \
 && npm run build:prod

# ============================================================
# Stage 2: Production — minimal image, NO source code
# ============================================================
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy ONLY compiled & obfuscated JS (no .ts, no source maps)
COPY --from=builder /app/dist ./dist

# Copy Prisma runtime (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy i18n JSON files
COPY --from=builder /app/src/i18n/*.json ./dist/i18n/

# Remove any accidentally included dev artifacts
RUN rm -rf /app/src /app/*.ts /app/tsconfig.json /app/scripts \
 && find /app/dist -name '*.map' -delete \
 && find /app/dist -name '*.d.ts' -delete

# Security: read-only filesystem for code
RUN chmod -R 555 /app/dist

# Switch to non-root
USER appuser

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/ || exit 1

CMD ["node", "dist/server.js"]
