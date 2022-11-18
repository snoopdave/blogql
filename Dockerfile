FROM node:16

WORKDIR /app
COPY ./server/package.json .
RUN npm init -y
RUN npm install
RUN mkdir src
COPY ./server/src/ ./src/
COPY ./server/schema.graphql .
COPY ./server/tsconfig.json .
RUN npm run build
CMD [ "npm", "run", "start" ]
EXPOSE 4000