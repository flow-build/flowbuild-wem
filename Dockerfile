FROM node:18
# FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install -g pnpm
RUN npm install -g typescript
RUN pnpm install
RUN pnpm run build
# RUN pnpm install --prod

ENV BROKER_HOST=$BROKER_HOST
ENV REDIS_HOST=$REDIS_HOST

CMD [ "pnpm", "run", "start" ]