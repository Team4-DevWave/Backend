# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /usr/src/app

COPY package*.json ./
# Install the application dependencies inside the Docker container
RUN npm install
# Install nodemon as a development dependency
RUN npm install --save-dev nodemon
# Copy the rest of the application code into the Docker container
COPY . .

EXPOSE 8000

# Define the command to start your application
CMD [ "node", "server.js" ]