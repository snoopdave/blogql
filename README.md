# Simple Blog Server with GraphQL API

This is a learning project; something I started to help me learn React, TypeScript and more about GraphQL and Apollo Studio. Here are some more details about the technologies in use:

## Server

* TypeScript
* Node.js
* Apollo GraphQL server
* Express for REST bits
* Google and API key authentication
* Support for SQLite3 and Postgres databases
* Jest tests
* [Apollo Studio](https://studio.apollographql.com/) schema checks and publish

## Client

* TypeScript
* Node.js
* Apollo GraphQL client
* React via Create React App
* React Router
* React Bootstrap
* Quill (rich text editor)
* Jest tests, Storybook stories and [Chromatic](https://chromatic.com) integration
 
## Infrastructure

* Github Actions
** On pull-request update: builds server & client, runs tests, builds serve Docker image and checks the GraphQL schema via the Apollo Rover CLI.
** On merge to main: does same steps and then publishes GraphQL schema to Apollo Studio.
* Work in progress: Helm charts for deploying to Kubernetes
