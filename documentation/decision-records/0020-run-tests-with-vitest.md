---
status: accepted
date: 2026-06-29
decision-makers: Thore Straßburg, Pram Gurusinga
---

# Run Tests with Vitest

## Context and Problem Statement

Working on the TypeScript library of the XJustiz-Bridge, we need a framework
to write and run our tests with.

Which framework should we use for testing purposes?

## Decision Drivers

- Full framework bundle with assertion, mocking, and harness.
- Support for in-source testing to increase cohesion and developer experience.
- Integration with type-level testing.

## Decision Outcome

Chosen option: "Vitest", because it provides currently the most definite package
for testing in the ecosystem. It is widely adopted and used in production.
Furthermore, it is the de facto standard in the company, used also by other
teams of the Access to Justice project.

### Consequences

- Good, because team members feel comfortable working with tests in this codebase.
- Good, because it basically works out of the box without much setup or extra dependencies.
- Good, because it allows us to use in-source testing with direct support.
- Good, because it allows us to write type-level tests with direct support.
- Good, because our test suite should run fast, providing quick feedback.
- Neutral, Vite is NodeJS focused, though widely compatible with other runtime environments.

## More Information

Because we think a high cohesion between implementation and tests is important
and leads to a good developer experience, we default to in-source tests for
typical, local-level unit tests. Test cases that integrate multiple units or
test more unit independent requirements are expected to live in separated test
modules within the source directory, using the `.test.ts` filename ending.
