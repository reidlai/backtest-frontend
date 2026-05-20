# OS security patch stage — fetches fixed Debian packages and exports them for the distroless runner.
# Fixes CVE-2026-0861 (libc6 >= 2.36-9+deb12u14) and CVE-2026-31789 (libssl3 >= 3.0.19-1~deb12u2).
FROM debian:bookworm-slim AS os-patches
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libssl3 && \
    rm -rf /var/lib/apt/lists/* && \
    LIBDIR=$(find /usr/lib -maxdepth 1 -name '*-linux-gnu' -printf '%f\n' | head -1) && \
    mkdir -p /patches/usr/lib/$LIBDIR && \
    cp /usr/lib/$LIBDIR/libssl.so.3 /patches/usr/lib/$LIBDIR/ && \
    cp /usr/lib/$LIBDIR/libcrypto.so.3 /patches/usr/lib/$LIBDIR/ && \
    cp /usr/lib/$LIBDIR/libc.so.6 /patches/usr/lib/$LIBDIR/ && \
    mkdir -p /patches/var/lib/dpkg/status.d && \
    dpkg-query -s libc6 > /patches/var/lib/dpkg/status.d/libc6 && \
    dpkg-query -s libssl3 > /patches/var/lib/dpkg/status.d/libssl3

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Runner
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app

# Apply OS security patches: overlay updated libraries and dpkg metadata.
COPY --from=os-patches /patches/usr/ /usr/
COPY --from=os-patches /patches/var/ /var/

COPY --from=builder /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER nonroot:nonroot

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]

CMD ["/app/build/index.js"]
