FROM node:16 AS build

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN npx webpack

FROM node:16-alpine
RUN apk add --no-cache libc6-compat
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
WORKDIR /app
ENTRYPOINT ["node", "build/bundle.js"]
