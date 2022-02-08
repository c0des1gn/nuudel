# specify the node base image with your desired version node:<version>
FROM node:lts-alpine@sha256:8c94a0291133e16b92be5c667e0bc35930940dfa7be544fb142e25f8e4510a45 as ts-compiler
ARG BRAND
#ENV NODE_ENV production

# replace this with your application's default port
EXPOSE 8080

WORKDIR /usr/app

COPY package*.json yarn.lock ./

# Add libvips
#RUN apk add --upgrade --no-cache vips-dev build-base --repository https://alpine.global.ssl.fastly.net/alpine/latest-stable/community/

# --production --frozen-lockfile --ignore-scripts=false
RUN yarn install --pure-lockfile --non-interactive --network-timeout 7200000

#COPY --chown=node:node --from=ts-compiler /usr/app/dist ./dist


COPY src src
COPY api api
COPY keys keys
COPY public public
COPY .next .next
COPY script script
COPY .env.dev next.config.js next-env.d.ts nodemon.json config.json tsconfig.json .fontello-session apollo.config.js .babelrc tsconfig.server.json tslint.json ./

COPY .env${BRAND} /usr/app/.env

#USER node
CMD ["yarn", "start"]