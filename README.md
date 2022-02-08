<h1 align="center"><strong>Backend for an Advanced GraphQL Server w/ TypeScript</strong></h1>

<br />

<div align="center"><strong>🚀 Bootstrap your GraphQL server within seconds</strong></div>
<div align="center">Advanced starter kit for a flexible GraphQL server for TypeScript - based on best practices from the GraphQL community.</div>

# start

yarn build
yarn go
yarn next

# docker

yarn build:prod
docker build --build-arg BRAND= -t nuudel_server .
docker tag nuudel_server registry.digitalocean.com/registry-container/nuudel_server
docker push registry.digitalocean.com/registry-container/nuudel_server:latest

# typed-scss-modules

yarn tsm src
