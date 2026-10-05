# AGENTS.md

BlogQL is a learning project: a blog app with an Apollo GraphQL server (`server/`) and a React client (`client/`), plus an autoblog agent (`agent/`). Each is a separate Yarn project with its own `package.json` and `yarn.lock`. There is no root workspace. Run commands from inside `server/`, `client/` or `agent/`. CI uses Node 18 (Node 24 for `agent/`).

## Commands

### Server (`server/`)

- `yarn build`: runs `tsc`. Output `.js` files go next to the `.ts` sources in `src/` (`outDir: src`). They are git-ignored.
- `yarn start`: builds, then runs `node src/index.js`. The server listens on `http://localhost:4000` (GraphQL at `/graphql`).
- `yarn test`: builds, then runs Jest in ESM mode (`--experimental-vm-modules`).
- Run one test file: `yarn test src/blogs/blogstore.it.test.ts`. Run one test by name: `yarn test -t "<name>"`.
- `yarn clean`: removes the compiled `.js` files.

### Client (`client/`)

- Before you build, create `src/googlecid.ts` (git-ignored) from `src/googlecid.sample.ts`. It exports `GOOGLE_SIGNON_CID`. CI uses `'dummy'`.
- `yarn build`: runs `codegen`, then `tsc`, then `webpack`.
- `yarn start`: builds, then runs `webpack-dev-server` on port 3000.
- `yarn test`: Jest with jsdom. Run one file: `yarn test src/blogs/BlogLists.test.tsx`.
- `yarn codegen`: generates `src/gql/` (typed documents, git-ignored) and `graphql.schema.json` from `client/schema.graphql` plus the operations in `src/graphql/`. Run it after you change queries or the schema.
- `yarn storybook`: builds, then starts Storybook on port 6006. CI publishes stories to Chromatic.

## Architecture

### GraphQL schema

- `server/schema.graphql` is the source of truth. `server/src/index.ts` loads it at runtime, and CI uses it for the Apollo Studio (Rover) schema check and publish.
- `client/schema.graphql` is a separate, generated copy that client codegen reads. It is not regenerated automatically. When you change the server schema, update the client copy too, then run `yarn codegen`.

### Server request flow

- `src/blogql.ts` sets up the Express app: CORS headers, `express-session`, and REST endpoints for Google sign-in (`POST /auth`, `GET /me`, `DELETE /logout`). `/auth` verifies the Google ID token, upserts the user, and stores `userId` in the session.
- `src/index.ts` mounts Apollo Server at `/graphql`. For each request, the context function finds the user from the session or from an `x-api-key` header (`ApiKeyStore`). It then builds a `BlogServiceSequelizeImpl` for that user.
- `src/resolvers.ts` contains thin resolvers. They delegate all work to `ctx.blogService`.
- `src/blogservice.ts` contains the business logic and authorization checks, such as "one blog per user" and "only the owner can edit". It uses the stores.
- Each domain folder (`blogs/`, `entries/`, `users/`, `apikeys/`) has a Sequelize model and a store class. Call `init()` on a store before you use it.
- `src/pagination.ts` implements Relay-style cursor connections (`first`/`last`/`before`/`after`) for blogs, entries, and drafts.
- Node IDs have the form `<uuid>-<type>`, for example `…-blog`. The `Node.__resolveType` resolver gets the GraphQL type from that suffix. Keep this format when you create IDs.
- The server is ESM (`"type": "module"`). Local imports must use the `.js` extension, even in `.ts` files.

### Database

`src/utils/dbconnection.ts` chooses the database in this order:
1. Postgres from `DATABASE_URL`. Production on Render uses this.
2. Postgres from `POSTGRES_HOSTNAME` (also uses `POSTGRES_DATABASE`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD`).
3. SQLite (`db-test1.db`, or the path in `SQLITE_DATA_PATH`). Local development and tests use this.

Tables are created with Sequelize `sync()`; there are no migrations. `src/index.ts` creates one `DBConnection` and one set of stores at startup and shares them across requests. Do not create a connection per request. A store's `init()` runs only once per store instance.

When `DATABASE_URL` is set, sessions are stored in Postgres (`connect-pg-simple`, `session` table). Otherwise they are kept in memory.

`*.it.test.ts` files are store integration tests against SQLite. `tests/e2e.test.ts` tests the full GraphQL API.

### Client

- The client calls the API with relative URLs (`/graphql`, `/auth`, `/me`, `/logout`), so the API and the client always share an origin and the session cookie is first-party. Locally, the webpack dev server proxies these paths to `localhost:4000`. On Render, static-site rewrites send them to the server. If you add an API path, add it in both `webpack.config.cjs` and `render.yaml`.
- `src/index.tsx` creates the Apollo Client.
- Only Google accounts in the server's `ALLOWED_EMAILS` (comma-separated) may log in. `isEmailAllowed()` in `server/src/utils/config.ts` is checked in `/auth`, in `/me`, and in the GraphQL context, so it also covers old sessions and API keys. An empty list allows everyone, except when `NODE_ENV=production`, where it allows nobody.
- `Authentication.tsx` provides the auth context (`ProvideAuth`) and the login, logout, and `/me` calls. `App.tsx` defines the React Router v6 routes.
- UI uses Ant Design. The entry editor uses Quill.
- GraphQL operations are in `src/graphql/queries.ts` and `src/graphql/mutations.ts`. Import types from the generated `src/gql/graphql`.
- Tests and Storybook mock the API with MSW (`src/mocks/handlers.ts`, fixtures, and `TestDataGenerator`). Tests wrap components in `src/tests/TestHarness.tsx`.

### Autoblog agent (`agent/`)

- A third Yarn project. It is a Render Workflow service: `src/tasks.ts` defines tasks with `@renderinc/sdk/workflows`, and the root task `autoblog` runs the others with `ctx.run`. See `agent/README.md`.
- It writes posts with Claude (`@anthropic-ai/sdk`, structured outputs) and saves them through the GraphQL API with an API key (`x-api-key`). It only creates drafts; it never publishes.
- Task arguments and results must be JSON. Keep prompts and logic in `src/autoblog.ts`, and keep `src/tasks.ts` thin.
- Always pass model HTML through `sanitizeContent()`: the client renders entry HTML with `dangerouslySetInnerHTML`.
- `yarn test` builds and runs `node --test` with fakes; it needs no API keys. `render workflows dev -- node dist/index.js` runs the tasks locally.
- Output goes to `dist/`, not next to the sources as in `server/`.

### CI/CD and deploy

- `.github/workflows/`: pull requests build and test the server, then the client, then publish stories to Chromatic, check the schema with Rover, and build Docker images. A merge to `main` also publishes the schema and pushes `snoopdave/blogql-server` and `snoopdave/blogql-client` images.
- `render.yaml` is the Render Blueprint: a free Postgres database, `blogql-server` (web service), `blogql-client` (static site), and `blogql-agent` (workflow). The client's rewrite rules contain the server hostname written out in full. `onrender.com` is a public suffix, so the client must not call the server's hostname directly; the session cookie would be third-party.
- `deploy/blogql/` has a Helm chart (work in progress). `deploy/local/` has local Kubernetes setup scripts.
