# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.20.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
EXPOSE 3000
ENV YARN_CACHE_FOLDER=/root/.yarn

FROM base AS build
COPY out/web/json/ .
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER} \
    yarn install --frozen-lockfile
COPY out/web/full/ .
RUN --mount=type=cache,target=.turbo \
    yarn build
WORKDIR /app/apps/web

FROM build AS dev
CMD ["yarn", "start:dev"]
