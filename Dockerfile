# Use the official Node.js 20 image as a parent image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy env file
COPY .env .env

# Copy the rest of app's source code
COPY . .

RUN npx prisma generate

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]