
# README.md: Github Action Workflows

This directory contains two workflows that run when changes are made to the BlogQL repo.
One runs when merges are made to main and one when changes are made to a pull request.
There are also four reusable actions.

The main actions:

* `merge-to-main.yaml`: runs builds, tests, GraphQL schema check and publishes schema and Docker image.
* `pull-request.yaml`: runs builds, tests, GraphQL schema check and verifies that Docker build works.

The re-usable actions:

* `build-test.yaml`: (no parameters) runs a Yarn build/test and a Docker build (no publish).
* `check-schema.yaml`: takes inputs working-dir, schema-path, graph-ref, ROVER_API_KEY and runs a rover graph check.
* `publish-schema.yaml`: takes inputs working-dir, schema-path, graph-ref, ROVER_API_KEY and runs a rover graph publish.
* `docker-build.yaml`: takes inputs push (boolean), tags, DOCKER_USERNAME and DOCKER_PASSWORD and runs a Docker build and optionally a push to associated DockerHub account.
