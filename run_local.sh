# !/bin/bash

export HTTP_PORT='80'
export NETATMO_USERNAME='audun@kvasbo.no'
export NETATMO_PASSWORD='EzR45wNW'
export NETATMO_CLIENT_SECRET='39SHH7Nba2iLJNDzUGAsIZGttYuhzt0Za02P8UTxT'
export NETATMO_CLIENT_ID='59eedb27ea00a0073d8b52ed'
export FIREBASE_USER='audun@kvasbo.no'
export FIREBASE_PASSWORD='cnadyman'
export TIBBER_KEY='272e9af8673aa8bcef149c9869e0697cdbfad92644893145887dc256829212d7'
export TIBBER_HOME='2b05f8c5-3241-465d-92b8-9e7ad567f78f'
export TIBBER_CABIN='61f93ce4-f15c-49c2-aac1-9d9f0e1d76bb'
export TIMBER_API_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1NjYyMTQxMjIsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjozOTUxLCJ1c2VyX2lkIjoiYXBpX2tleXwzOTUxIn0sInN1YiI6ImFwaV9rZXl8Mzk1MSJ9.6rkcufpKnKvHfJz-xiIroCTBUaVBLQactW-s4y797Vo'

cd server
yarn run build
cd ..
node ./server/dist/index.js