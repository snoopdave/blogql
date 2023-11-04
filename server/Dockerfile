FROM node:18

WORKDIR /app
COPY package.json .
RUN yarn install
RUN mkdir src
COPY src ./src/
COPY schema.graphql .
COPY tsconfig.json .
RUN yarn build
CMD [ "yarn", "start" ]
EXPOSE 4000