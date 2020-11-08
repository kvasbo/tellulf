# !/bin/bash

source .env

cd server
yarn run build
cd ..
node ./server/dist/index.js