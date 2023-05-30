
# Build dependencies
FROM node:18.14.2 as dependencies
WORKDIR /app
ENV PORT 8080
ENV HOST 0.0.0.0
COPY package.json .
RUN npm install 


COPY . . 
# Build production image
# FROM dependencies as builder
# RUN npm run build
EXPOSE 3000

# start command
CMD ["npm", "run", "start:prod"]