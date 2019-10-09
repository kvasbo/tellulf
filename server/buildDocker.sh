#!/bin/bash

read -p "Enter tag: "  tag
echo "Building $tag!"
echo "...but why are you pushing docker manually?"

yarn run build
docker build -t kvasbo/tellulf .
docker push kvasbo/tellulf

docker tag kvasbo/tellulf:latest kvasbo/tellulf:$tag
docker push kvasbo/tellulf:$tag