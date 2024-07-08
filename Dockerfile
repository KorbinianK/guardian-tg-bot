# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Define the command to run the application
CMD ["pnpm", "start"]
