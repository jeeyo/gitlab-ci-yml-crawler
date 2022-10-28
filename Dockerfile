FROM node:16 AS build
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn

# Compile and bundle
COPY . ./
RUN yarn webpack

FROM node:16-alpine
WORKDIR /app

# Install libc for Node.js Native Modules
RUN apk add --no-cache libc6-compat

COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json

ENTRYPOINT ["node", "build/bundle.js"]
