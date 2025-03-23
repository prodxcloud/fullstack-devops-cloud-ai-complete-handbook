

## How prodxcloud.io PROD
# Because this part will run next js in development mode with port 3000, we can run the following command to build the image
docker build -t joelwembo/prodxcloud:latest .
docker run -p 3000:3000 --name prodxcloud joelwembo/prodxcloud:latest