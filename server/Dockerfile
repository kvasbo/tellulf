FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --network-timeout 1000000

COPY ./dist .

CMD [ "yarn", "startInProduction" ]