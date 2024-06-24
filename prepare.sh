#!/bin/bash

echo "🔹 started bootstrapping server"

cd server

docker compose up -d

echo "🔹 finished bootstrapping server"

echo "🔹 started installing client's dependencies"

cd ../client

npm ci

npm run build

echo "🔹 finished installing client's dependencies"


