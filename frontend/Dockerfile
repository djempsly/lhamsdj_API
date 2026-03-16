# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 2: Build — compile Next.js (no source maps in output)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (injected via docker-compose args)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID

# Build produces minified, mangled output with NO source maps
# (productionBrowserSourceMaps: false in next.config.mjs)
RUN npm run build

# Remove any source maps that might have been generated
RUN find .next -name '*.map' -delete 2>/dev/null || true

# ============================================================
# Stage 3: Production — minimal image, NO source code
# ============================================================
FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy ONLY build output (no .tsx/.ts source files)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config* ./
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/src/i18n ./src/i18n

# Remove any leftover source maps and dev artifacts
RUN find /app/.next -name '*.map' -delete 2>/dev/null || true \
 && rm -rf /app/src/app /app/src/components /app/src/services /app/src/lib \
           /app/src/types /app/src/data /app/src/__tests__

# Security: make build output read-only
RUN chmod -R 555 /app/.next

# Switch to non-root
USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["npm", "start"]
