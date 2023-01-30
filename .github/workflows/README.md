
# README.md: Github Action Workflows

This directory contains two workflows that run when changes are made to the BlogQL repo.
One runs when merges are made to main and one when changes are made to a pull request.
There are also four reusable actions.

The main actions:

* `merge-to-main.yaml`: Triggered when merge is made to main. Runs builds, tests, Apollo GraphQL schema publish, Chromatic Stories publish and Docker image build/publish.
* `pull-request.yaml`: Triggered when a Pull Request is created or updated. Runs builds, tests, Apollo GraphQL schema check, Chromatic Story check and verifies that Docker build works.

The re-usable actions:

* `wf-client-tests.yaml`: Build and test client. (no parameters)
* `wf-server-tests.yaml`: Build and test server. (no parameters)
* `wf-check-schema.yaml`: Runs Apollo GraphQL schema check. Takes inputs working-dir & schema-path, uses secrets APOLLO_KEY & APOLLO_GRAPH_REF and then runs a rover graph check.
* `wf-publish-schema.yaml`: Publishes schema to Apollo. Takes inputs working-dir & schema-path, uses secrets APOLLO_KEY & APOLLO_GRAPH_REF.
* `wf-publish-stories.yaml`: Publishes Stories to Chromatic to be checked. Takes secret CHROMATIC_PROJECT_TOKEN.
* `wf-docker-build.yaml`: Runs Docker build and optionally publishes to Docker. Takes inputs push (boolean), tags, DOCKER_USERNAME and DOCKER_PASSWORD. 

