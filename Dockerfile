FROM node:lts-alpine@sha256:ca5d399560a9d239cbfa28eec00417f1505e5e108f3ec6938d230767eaa81f61 AS base
ARG BRAND

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
#COPY --chown=nextjs:nodejs . .
COPY --chown=nextjs:nodejs package.json yarn.lock* ./
COPY --chown=nextjs:nodejs src src
COPY --chown=nextjs:nodejs api api
COPY --chown=nextjs:nodejs keys keys
COPY --chown=nextjs:nodejs public public
COPY --chown=nextjs:nodejs script script
COPY --chown=nextjs:nodejs .env.development next.config.js next-env.d.ts nodemon.json config.json tsconfig.json .fontello-session apollo.config.js tsconfig.server.json tslint.json ./
COPY --chown=nextjs:nodejs .env${BRAND} ./.env

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN env
ENV NODE_ENV production

RUN yarn build:next
RUN chown -R nextjs:nodejs ./.next
USER nextjs



EXPOSE 8080

ENV PORT 8080

CMD ["yarn", "start"]
