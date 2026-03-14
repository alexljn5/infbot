# infbot/Dockerfile.dev
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to install deps
COPY package*.json ./

RUN npm install

# Copy the rest of the code
COPY . .

# Start the bot with nodemon
CMD ["npx", "nodemon", "src/heavensgate.js"]