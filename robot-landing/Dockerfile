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

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=robot-landing-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set registry "${PACKAGE_REGISTRY}" && \
    pnpm install --frozen-lockfile

# Dev stage for running vite dev server inside container
FROM base AS dev
COPY . .
ENV NODE_ENV=development
EXPOSE 5176
CMD ["pnpm", "dev", "--host"]

# Production build stage
FROM base AS builder

COPY . .

ENV NODE_ENV=production

ARG VITE_PERPIX_APP_URL
ARG VITE_PHONE_PARAM
ARG VITE_PHONE_FORMAT

ENV VITE_PERPIX_APP_URL=${VITE_PERPIX_APP_URL} \
    VITE_PHONE_PARAM=${VITE_PHONE_PARAM} \
    VITE_PHONE_FORMAT=${VITE_PHONE_FORMAT}

RUN pnpm build

# Production runner stage
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

USER nginx
WORKDIR /usr/share/nginx/html

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist .

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

