# Base image is Node.js v20: this image is based on Alpine Linux, a lightweight Linux distribution, but the image size is still ~600MB. Takes around 30-60 seconds to build.
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /client

# Copy package.json and package-lock.json 
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the frontend dev server port 3000
EXPOSE 3000

# Default command to run when the container starts
CMD ["npm", "run", "dev"]