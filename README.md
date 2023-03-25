# BlogQL: Simple Blog Server with GraphQL API

This is a learning project; something I started to help enhance my knowlege of learn Node, TypeScript, React, GraphQL and GitHub Actions. 
The server uses Express, Apollo Server and Sequalize to persist data in SQLite.
The client uses React and the Quill rich-text editor.

Here's 

[![Two-minute demo of BlogQL UI](http://i.imgur.com/7YTMFQp.png)](https://vimeo.com/3514904 "BlogQL UI - Click to Watch!")


Here are the details about the technologies in use:

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
* [Ant Design componments](https://ant.design)
* [Apollo GraphQL client](https://www.apollographql.com/docs/react/)
* [Quill](https://quilljs.com) (rich text editor)
* [Webpack](https://webpack.js.org) bundling and dev server
* [Storybook](https://storybook.js.org) stories and [Chromatic](https://chromatic.com) snapshot checks
  * You can view the components in the public [Storybook](https://63b0bf0f112b2d8b80a785f5-flfdjbdgsu.chromatic.com/)
 
## Infrastructure

* Github Actions
   * [On pull-request update](https://github.com/snoopdave/blogql/blob/main/.github/workflows/pull-request.yaml): build, runs tests, builds Docker image and checks GraphQL schema.
   * [On merge to main](https://github.com/snoopdave/blogql/blob/main/.github/workflows/merge-to-main.yaml): does same steps and then publishes GraphQL schema to Apollo Studio.
* Work in progress: Helm charts for deploying to Kubernetes
