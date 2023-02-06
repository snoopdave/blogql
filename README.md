# BlogQL: Simple Blog Server with GraphQL API

This is a learning project; something I started to help me learn React, TypeScript and more about GraphQL and Apollo Studio. Here are some more details about the technologies in use:

## Common
* [Node.js](https://nodejs.org/en/)
* [TypeScript](https://www.typescriptlang.org)
* [Google Sign-in](https://developers.google.com/identity/sign-in/web/sign-in)
* [Jest](https://jestjs.io) tests.

## Server
* [Express](https://expressjs.com) for REST bits
* [Apollo GraphQL server](https://www.apollographql.com/docs/apollo-server/)
* [SQLite3](https://www.sqlite.org/index.html) or [Postgres](https://www.postgresql.org) database persistence
* API key authentication
* [Apollo Studio](https://studio.apollographql.com/) schema checks and publish

## Client
* [React.js](https://reactjs.org) application
* [React Router v5](https://v5.reactrouter.com)
* [React Bootstrap](https://react-bootstrap.github.io)
* [Apollo GraphQL client](https://www.apollographql.com/docs/react/)
* [Quill](https://quilljs.com) (rich text editor)
* [Webpack](https://webpack.js.org) bundling and dev server
* [Storybook](https://storybook.js.org) stories and [Chromatic](https://chromatic.com) snapshot checks
 
## Infrastructure

* Github Actions
   * On pull-request update: build, runs tests, builds Docker image and checks GraphQL schema.
   * On merge to main: does same steps and then publishes GraphQL schema to Apollo Studio.
* Work in progress: Helm charts for deploying to Kubernetes
