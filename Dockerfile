
# Build dependencies
FROM node:18.14.2 as dependencies
WORKDIR /app
ENV PORT 8080
ENV HOST 0.0.0.0
COPY package.json .
# COPY ENV variable
COPY .env.development ./
COPY .env.production ./
COPY . . 
RUN npm install 



# Build production image
# FROM dependencies as builder
# RUN npm run build
EXPOSE 8080

# start command
CMD ["npm", "run", "start:prod"]