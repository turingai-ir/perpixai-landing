# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base

SHELL ["/bin/sh", "-e", "-c"]

WORKDIR /app

ENV CI=true \
    PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"

ARG PNPM_VERSION=11.4.0
ARG PACKAGE_REGISTRY=https://registry.npmmirror.com
ENV COREPACK_NPM_REGISTRY=${PACKAGE_REGISTRY} \
    COREPACK_ENABLE_UNSAFE_CUSTOM_URLS=1 \
    NPM_CONFIG_REGISTRY=${PACKAGE_REGISTRY}

RUN corepack enable && \
    corepack prepare "pnpm@${PNPM_VERSION}" --activate || \
    npm install --global "pnpm@${PNPM_VERSION}"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=robot-landing-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set registry "${PACKAGE_REGISTRY}" && \
    pnpm install --frozen-lockfile

# Dev stage for running the Next.js dev server inside container
FROM base AS dev
COPY . .
ENV NODE_ENV=development
EXPOSE 5176
CMD ["pnpm", "dev", "-H", "0.0.0.0"]

# Production build stage
FROM base AS builder

COPY . .

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

# Inlined at build time (static export), so they must be build args, not runtime env.
ARG NEXT_PUBLIC_PERPIX_APP_URL
ARG NEXT_PUBLIC_PHONE_PARAM
ARG NEXT_PUBLIC_PHONE_FORMAT

ENV NEXT_PUBLIC_PERPIX_APP_URL=${NEXT_PUBLIC_PERPIX_APP_URL} \
    NEXT_PUBLIC_PHONE_PARAM=${NEXT_PUBLIC_PHONE_PARAM} \
    NEXT_PUBLIC_PHONE_FORMAT=${NEXT_PUBLIC_PHONE_FORMAT}

RUN pnpm build

# Production runner stage
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

USER nginx
WORKDIR /usr/share/nginx/html

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/out .

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

