# Simple Blog Server with GraphQL API

This is a learning project; something I started to help me learn React, TypeScript and more about GraphQL and Apollo Studio. Here are some more details about the technologies in use:

## Common
* [TypeScript](https://www.typescriptlang.org)
* [Node.js](https://nodejs.org/en/)

## Server
* [Apollo GraphQL server](https://www.apollographql.com/docs/apollo-server/)
* [Express](https://expressjs.com) for REST bits
* [Google Sign-in](https://developers.google.com/identity/sign-in/web/sign-in) and API key authentication
* Support for [SQLite3](https://www.sqlite.org/index.html) and [Postgres](https://www.postgresql.org) databases
* [Jest](https://jestjs.io) tests and [Apollo Studio](https://studio.apollographql.com/) schema checks and publish

## Client
* [Apollo GraphQL client](https://www.apollographql.com/docs/react/)
* [React Router v5](https://v5.reactrouter.com)
* [React Bootstrap](https://react-bootstrap.github.io)
* [Quill](https://quilljs.com) (rich text editor)
* [Webpack](https://webpack.js.org) bundling and dev server
* [Jest](https://jestjs.io) tests, [Storybook](https://storybook.js.org) stories and [Chromatic](https://chromatic.com) integration
 
## Infrastructure

* Github Actions
   * On pull-request update: build, runs tests, builds Docker image and checks GraphQL schema.
   * On merge to main: does same steps and then publishes GraphQL schema to Apollo Studio.
* Work in progress: Helm charts for deploying to Kubernetes
