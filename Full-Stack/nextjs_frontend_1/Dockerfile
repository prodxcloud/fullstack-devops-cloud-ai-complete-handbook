# pull official base image
FROM node:20-alpine as build
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
# Can potentially speed up the build times by using npm install --production and removing lint run 
# on next build
RUN npm install

# Copy all files
COPY ./ ./

# Set environment variable to address OpenSSL error
ENV NODE_OPTIONS=--openssl-legacy-provider
# Build app
RUN npm run build && ls -al
# Install the 'serve' package globally
RUN npm install -g serve
# Set NODE_ENV to production
ENV NODE_ENV=production
# Expose the listening port
EXPOSE 3000
EXPOSE 3000/tcp
EXPOSE 80
EXPOSE 80/tcp
EXPOSE 443
# Give ownership of /app folder to the node user that will be running the 
# npm start script
RUN chown -Rh node:node /app
# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node
# Run npm start script when container starts ( this is production ready npm start for nextjs get file from build direactory)
# CMD [ "npm", "start" ]
## OR USE SERVE TO START THE APPLICATION
# Start the application using 'serve'
CMD ["serve", "-s", "build"]