# BlogQL autoblog agent

An agent that writes BlogQL posts with Claude and saves them as **drafts**. It never publishes;
the blog owner reads each draft and publishes it in BlogQL.

It runs on [Render Workflows](https://render.com/docs/workflows). Each step is a task, so
Render runs each step on its own instance, retries it when it fails, and shows it as a run in
the dashboard:

```
autoblog(input)                      the root task
  ├─ fetchRecentTitles(blogHandle)   BlogQL GraphQL: published titles, so topics do not repeat
  ├─ chooseTopic(titles, hint?)      Claude: title, point and outline
  ├─ draftPost(topic)                Claude: HTML body
  ├─ editPost(post)                  Claude, as editor: removes doubtful claims, fixes code, shortens
  └─ saveDraft(blogHandle, post)     sanitizes the HTML, then createEntry with the owner's API key
```

- Claude returns JSON that matches a schema (structured outputs), so there is no text parsing.
- BlogQL renders entry HTML as is, so `saveDraft` keeps only a small set of tags and `http(s)` links.
- `saveDraft` first looks for a draft with the same title, so a retry does not save the post twice.
- Workflows cannot schedule runs yet. A Render cron job runs `dist/trigger.js` every Monday.
  It uses an idempotency key per day, so a retried cron job does not start a second run.

## Files

| File | What it does |
|---|---|
| `src/tasks.ts` | The workflow tasks: plans, timeouts, retries |
| `src/autoblog.ts` | Prompts, schemas and HTML sanitizing, without Render |
| `src/llm.ts` | Claude client (`@anthropic-ai/sdk`) |
| `src/blogql.ts` | BlogQL GraphQL client |
| `src/index.ts` | Start command: registers the tasks |
| `src/trigger.ts` | Starts one `autoblog` run with the Render SDK |

## Run locally

```sh
yarn install
yarn test                        # builds, then runs the tests; no API keys needed
cp .env.example .env             # fill in ANTHROPIC_API_KEY and BLOGQL_API_KEY
brew install render
render workflows dev -- node dist/index.js
```

In another terminal:

```sh
render workflows tasks list --local
render workflows start fetchRecentTitles --local --input='["testblog"]'
render workflows start autoblog --local --input='[{"hint": "Render Workflows"}]'
```

## Deploy

`render.yaml` defines `blogql-agent` (workflow) and `blogql-agent-cron` (cron job). After the
Blueprint sync, set these in the Render dashboard:

- `blogql-agent`: `ANTHROPIC_API_KEY`, and `BLOGQL_API_KEY` (BlogQL > blog settings > API key).
  If the Anthropic key is not scoped to a workspace, also set `ANTHROPIC_WORKSPACE_ID`.
- `blogql-agent-cron`: `RENDER_API_KEY`. If Render gave the workflow another slug, set
  `AUTOBLOG_WORKFLOW_SLUG` to it.

Start a run without waiting for Monday:

```sh
render workflows start blogql-agent/autoblog --input='[{"hint": "GraphQL pagination"}]'
```

Neither service has a free plan: Workflows and cron jobs bill per second of compute.
