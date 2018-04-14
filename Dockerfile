FROM node:carbon

RUN echo "Y" | apt-get update
RUN echo "Y" | apt-get install postgresql-9.4

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source

EXPOSE 3000
CMD [ "npm", "start"]