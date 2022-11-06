FROM node:16

WORKDIR /usr/src/app
COPY server/package*.json ./
RUN npm install
COPY server/* .
EXPOSE 4000
CMD [ "npm", "run", "start" ]