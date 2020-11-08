FROM node:latest

RUN mkdir /tellulf
RUN mkdir /tellulf/client
RUN mkdir /tellulf/server

COPY client /tellulf/client
COPY server /tellulf/server

# build client
WORKDIR /tellulf/client
RUN yarn
RUN yarn run build

# build server
WORKDIR /tellulf/server
RUN yarn
RUN yarn run build

CMD ["node", "/tellulf/server/dist/server.js"]