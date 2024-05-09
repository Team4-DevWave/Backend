# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set environment variable for Puppeteer
ENV PUPPETEER_PRODUCT=chrome
# Install the application dependencies inside the Docker container
RUN npm install

# If Puppeteer doesn't get installed via package.json
RUN npm install puppeteer
# Add this line to download the necessary browsers
RUN npx puppeteer install chrome
# Add user so we aren't running as root
RUN adduser --disabled-password --gecos '' --shell /bin/bash user \
    && chown -R user:user /usr/src/app \
    && chmod 755 /usr/src/app

USER user

# Copy the rest of the application code into the Docker container
COPY --chown=user:user . .

EXPOSE 8000 
EXPOSE 3005

# Define the command to start your application
CMD [ "node", "server.js" ]