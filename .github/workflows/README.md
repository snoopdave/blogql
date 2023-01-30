
# README.md: Github Action Workflows

This directory contains two workflows that run when changes are made to the BlogQL repo.
One runs when merges are made to main and one when changes are made to a pull request.
There are also four reusable actions.

The main actions:

* `merge-to-main.yaml`: triggered when merge is made to main. Runs builds, tests, GraphQL schema check and publishes schema and Docker image.
* `pull-request.yaml`: triggered when a Pull Request is created or updated. Runs builds, tests, GraphQL schema check and verifies that Docker build works.

The re-usable actions:

* `wf-build-test.yaml`: (no parameters) runs a Yarn build/test and a Docker build (no publish).
* `wf-check-schema.yaml`: takes inputs working-dir & schema-path, uses secrets APOLLO_KEY & APOLLO_GRAPH_REF and then runs a rover graph check.
* `wf-publish-schema.yaml`: takes inputs working-dir & schema-path, uses secrets APOLLO_KEY & APOLLO_GRAPH_REF and then runs a rover graph publish.
* `wf-publish-stories.yaml`: takes secret CHROMATIC_PROJECT_TOKEN and publishes Storybook Stories to Chromatic to be checked. 
* `wf-docker-build.yaml`: takes inputs push (boolean), tags, DOCKER_USERNAME and DOCKER_PASSWORD and runs a Docker build and optionally a push to associated DockerHub account.
