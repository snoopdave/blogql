# BlogQL

*Simple blog app with a GraphQL backend and React frontend*

BlogQL is a learning project; something I started to help enhance my knowledge of learn Node, TypeScript, React, GraphQL and GitHub Actions.
Currently the system supports login via Google, single blog per user, a rich-text blog post editor and a GraphQL API accessible via API key.

Here's a two-miniute video demo of the BlogQL UI as it stands today:

[![Two-minute demo of BlogQL UI](https://github.com/snoopdave/blogql/blob/main/demo/demo-image.png)](https://vimeo.com/811456421 "BlogQL UI - Click to Watch!")

## The stack

Here's a listing of the technologies used in BlogQL.

### Common
* [Node.js](https://nodejs.org/en/)
* [TypeScript](https://www.typescriptlang.org)
* [Google Sign-in](https://developers.google.com/identity/sign-in/web/sign-in)
* [Jest](https://jestjs.io) tests.

### Server
* [Express](https://expressjs.com) for REST bits
* [Apollo GraphQL server](https://www.apollographql.com/docs/apollo-server/)
* [SQLite3](https://www.sqlite.org/index.html) or [Postgres](https://www.postgresql.org) database persistence
* [Apollo Studio](https://studio.apollographql.com/) schema checks and publish

### Client
* [React.js](https://reactjs.org) application
* [React Router v5](https://v5.reactrouter.com)
* [Ant Design componments](https://ant.design)
* [Apollo GraphQL client](https://www.apollographql.com/docs/react/)
* [Quill](https://quilljs.com) (rich text editor)
* [Webpack](https://webpack.js.org) bundling and dev server
* [Storybook](https://storybook.js.org) stories and [Chromatic](https://chromatic.com) snapshot checks
  * You can view the components in the public [Storybook](https://63b0bf0f112b2d8b80a785f5-flfdjbdgsu.chromatic.com/)
 
### Infrastructure

* Github Actions
   * [On pull-request update](https://github.com/snoopdave/blogql/blob/main/.github/workflows/pull-request.yaml): build, runs tests, builds Docker image and checks GraphQL schema.
   * [On merge to main](https://github.com/snoopdave/blogql/blob/main/.github/workflows/merge-to-main.yaml): does same steps and then publishes GraphQL schema to Apollo Studio.
* Work in progress: Helm charts for deploying to Kubernetes
