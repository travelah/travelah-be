
# Build dependencies
FROM node:18.14.2 as dependencies
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . . 
# Build production image
# FROM dependencies as builder
# RUN npm run build
EXPOSE 8080

# start command
CMD ["npm", "run", "start:prod"]