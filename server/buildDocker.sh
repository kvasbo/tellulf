#!/bin/bash

read -p "Enter tag: "  tag
echo "Building $tag!"

./node_modules/.bin/babel src --out-dir dist
docker build -t kvasbo/tellulf .
docker push kvasbo/tellulf

docker tag kvasbo/tellulf:latest kvasbo/tellulf:$tag
docker push kvasbo/tellulf:$tag