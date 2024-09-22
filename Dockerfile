# Use the official Node.js 16 image as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of app's source code
COPY . .

# Build app
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]