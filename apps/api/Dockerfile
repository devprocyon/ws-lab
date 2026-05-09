# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.20.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
EXPOSE 5000
ENV YARN_CACHE_FOLDER=/root/.yarn

FROM base AS build
COPY out/api/json/ .
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER} \
    yarn install --frozen-lockfile
COPY out/api/full/ .
RUN --mount=type=cache,target=.turbo \
    yarn build
WORKDIR /app/apps/api

FROM build AS dev
CMD ["yarn", "start:dev"]
