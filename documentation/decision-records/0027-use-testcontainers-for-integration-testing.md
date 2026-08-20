---
status: approved
decision-makers: Pram Gurusinga, Thore Straßburg
date: 2026-08-18
---

# Use Testcontainers for Integration Testing

## Context and Problem Statement

The XJustiz-Bridge is implemented as a TypeScript library that integrates
with the XJustiz-Tools. The XJustiz-Tools is operated as a service and bundled
as an OCI image by the Court Communication team. To ensure our library
communicates correctly with this service, we must run robust integration tests.

Our codebase currently uses Vitest as the testing framework. For our test suite
to verify the integration automatically and reliably, we need a way to spin up
the XJustiz-Tools OCI container before the tests run and tear it down afterward.
The solution must manage dynamic port mappings, wait for the service to be
healthy, and clean up resources even if a test fails.

How should we programmatically orchestrate the XJustiz-Tools OCI container
during our integration tests?

## Decision Drivers

- Automated container lifecycle management (startup, port mapping, and
  cleanup).
- Seamless integration with our existing Vitest test suite.
- High developer experience with low setup complexity to maintain.
- Reliable health checking to ensure the service is ready before tests execute.

## Considered Options

- Testcontainers
- Dockerode (Direct Docker API Client)
- Node.js Child Process

## Decision Outcome

Chosen option: "Testcontainers", because it gives us a straightforward way to manage
containers directly in our code specifically for testing. It fits perfectly into
our regular test setup and automatically takes care of the heavy lifting:
finding open ports, waiting for the container to actually be ready, and making
sure everything gets cleaned up reliably when the tests finish.

### Consequences

- Good, because the container lifecycle is managed entirely in TypeScript code
  alongside the tests, providing a better developer experience.
- Good, because it prevents orphaned containers by automatically cleaning up
  after test failures.
- Good, because it dynamically assigns available host ports for each run,
  preventing collisions with other services running on the developer's machine.

## Pros and Cons of the Options

### Testcontainers

- Good, because it abstracts away the complex boilerplate of container
  orchestration.
- Good, because it natively supports wait strategies (e.g., waiting for health
  endpoint) to ensure the container is ready before test execution.
- Neutral, because it adds another testing-specific library to the Node.js
  ecosystem.

### Dockerode

- Good, because it provides granular control over the Docker Engine API.
- Bad, because it requires developers to manually implement wait strategies,
  dynamic port resolution, and cleanup logic.
- Bad, because it significantly increases the cognitive load and boilerplate in
  the test setup.

### Node.js Child Process

- Good, because it introduces zero additional dependencies, relying purely on
  native shell commands.
- Neutral, because while it is slightly faster, benchmarking showed it only
  saves 1 second compared to Testcontainers.
- Bad, because manually handling wait strategies, port resolution, and cleanup
  significantly increases test boilerplate and cognitive load.
