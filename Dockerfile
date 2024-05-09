# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies inside the Docker container
RUN npm install

# If Puppeteer doesn't get installed via package.json
RUN npm install puppeteer

# Download and install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

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