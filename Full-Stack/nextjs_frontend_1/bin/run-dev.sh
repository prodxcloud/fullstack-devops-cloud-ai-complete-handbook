#!/bin/bash

docker login
docker build -f Dockerfile.dev  -t joelwembo/prodxcloud-dev:latest .
docker push joelwembo/prodxcloud-dev:latest 
docker run -p 80:80 --name react-app-1 joelwembo/prodxcloud-dev:latest 
