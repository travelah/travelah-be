# Build dependencies
FROM node:18.14.2 as dependencies
WORKDIR /app
ENV PORT 8080
ENV HOST 0.0.0.0
COPY package.json .
# COPY ENV variable

# generated prisma files
COPY prisma ./prisma/
# COPY .env.development ./
COPY .env.production ./
COPY . .
RUN npm install

# Set NODE_ENV environment variable
ENV DATABASE_URL="mysql://root:travelah123@35.239.95.230/travelah-db?unix_socket=/cloudsql/travelah-388302:us-central1:travelah-sql"
ENV NODE_ENV production

# Build production image
# FROM dependencies as builder
# RUN npm run build
EXPOSE 8080 3001
# EXPOSE 3001

# start command
CMD ["npm", "run", "start:prod"]
