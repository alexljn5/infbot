# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the bot code
COPY . .

# Expose any ports if necessary (Discord bots don’t need this usually)
# EXPOSE 3000

# Start the bot
CMD ["node", "src/heavensgate.js"]