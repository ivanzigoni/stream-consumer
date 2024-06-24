FROM node:20-alpine3.19 as build

WORKDIR /app

COPY . /app

RUN ["npm", "ci"]

RUN ["npm", "run", "build"]

FROM node:20-alpine3.19 as release

LABEL name="base-node-ffmpeg"

ENV node_env "release"

# RUN apk update && \
#   apk upgrade && \
#   apk add --no-cache ffmpeg

COPY --from=build /app/package*.json .

RUN npm ci --omit-dev

COPY --from=build /app/dist /dist

CMD ["node", "dist/index.js"]
