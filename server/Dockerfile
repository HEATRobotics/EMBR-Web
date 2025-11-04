# Use Node.js official image as base
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /server

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files in /express into the container image
COPY . .

# Expose the port
EXPOSE 3100

# Start the server with nodemon for hot reload
CMD ["npm", "run", "dev"]
