FROM node:18

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
RUN mkdir src
COPY src ./src/
COPY babel.config.cjs .
COPY schema.graphql .
COPY tsconfig.json .
COPY codegen.ts .
COPY webpack.config.cjs .
COPY yarn.lock .
RUN yarn build
CMD [ "yarn", "start" ]
EXPOSE 4000