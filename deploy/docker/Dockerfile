# distroless-base: extracted only to patch its dpkg metadata in os-patches
FROM gcr.io/distroless/nodejs22-debian12 AS distroless-base

# OS security patch stage — fetches fixed Debian packages, patches the distroless
# dpkg metadata, and exports updated library files.
# Fixes CVE-2026-0861 (libc6 >= 2.36-9+deb12u14) and CVE-2026-31789 (libssl3 >= 3.0.19-1~deb12u2).
FROM debian:bookworm-slim AS os-patches
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Copy distroless dpkg directory, patch version entries in the combined status file
# (primary Trivy read path), and write status.d entries (secondary read path).
COPY --from=distroless-base /var/lib/dpkg/ /distroless-dpkg/
RUN STATUS=/distroless-dpkg/status && \
    if [ -f "$STATUS" ]; then \
      sed -i '/^Package: libc6$/,/^$/{s/^Version: .*/Version: 2.36-9+deb12u14/}' "$STATUS" && \
      sed -i '/^Package: libssl3$/,/^$/{s/^Version: .*/Version: 3.0.20-1~deb12u1/}' "$STATUS"; \
    fi && \
    mkdir -p /distroless-dpkg/status.d && \
    dpkg-query -s libc6 > /distroless-dpkg/status.d/libc6 && \
    dpkg-query -s libssl3 > /distroless-dpkg/status.d/libssl3 && \
    LIBDIR=$(find /usr/lib -maxdepth 1 -name '*-linux-gnu' -printf '%f\n' | head -1) && \
    mkdir -p /patches/usr/lib/$LIBDIR && \
    cp /usr/lib/$LIBDIR/libssl.so.3 /patches/usr/lib/$LIBDIR/ && \
    cp /usr/lib/$LIBDIR/libcrypto.so.3 /patches/usr/lib/$LIBDIR/ && \
    cp /usr/lib/$LIBDIR/libc.so.6 /patches/usr/lib/$LIBDIR/

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

# Apply OS security patches: updated library .so files and patched dpkg metadata.
COPY --from=os-patches /patches/usr/ /usr/
COPY --from=os-patches /distroless-dpkg/ /var/lib/dpkg/

COPY --from=builder /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER nonroot:nonroot

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]

CMD ["/app/build/index.js"]
