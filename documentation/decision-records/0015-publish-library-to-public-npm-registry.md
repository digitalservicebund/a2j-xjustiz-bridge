---
status: accepted
date: 2026-05-22
decision-makers: Thore Straßburg, Pram Gurusinga
consulted: Niko Felger
---

# Publish Library to Public NPM Registry

## Context and Problem Statement

The XJustiz-Bridge is provided as a TypeScript library. The goal is to
maintain an X-as-a-service relationship. That concludes into the decision to
publish the library as a package and allow users to install it as conveniently
as possible like a regular runtime dependency.

How and where should the library be published to?

## Decision Drivers

- Convenience of dependency installation by library users.
- Ability to get library updates via Dependabot integration by library users.
- Effort for the release pipeline by the Court Communication team.

## Considered Options

- Public NPM Registry
- GitHub Package Registry
- Dedicated Git Release Branch

## Decision Outcome

Chosen option: "Public NPM Registry", because it is the most idiomatic option
that provides the best developer experience with a flawless workflow. The
Dependabot integration also just works without extra setup.

Check out the section with [more information](#more-information) for the exact
handling.

### Consequences

- Good, because the library can be installed like almost any other dependency.
- Good, because the library users can have automated updates using Dependabot.
- Good, because the package registry is independent of the repository hosting service.
- Neutral, because we need a trusted continuous deployment pipeline to publish.
- Neutral, because this makes the library more publicly visible while being scoped to the company.

## Pros and Cons of the Options

### Public NPM Registry

Primary package registry of the ecosystem.

- Good, because the library can be installed straight forward.
- Good, because it doesn't require additional configuration by library users.
- Good, because it works out-of-the-box with Dependabot.
- Good, because we can publish independent from the repository hosting service.
- Neutral, because we need a trusted continuous deployment pipeline to publish.

### GitHub Packages Registry

See the related GitHub [documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

- Neutral, because it is more privately and directly attached to the repository.
- Neutral, because it works without additional security from within GitHub Actions pipelines.
- Neutral, because it is limited to the GitHub service specifically.
- Bad, because any read access to install or update the library requires a GitHub token by users.
- Bad, because it requires extra setup to make Dependabot work for this library.
- Bad, because installation requires some configuration in the `.npmrc` file.

### Dedicated Git Release Branch

This is more of a do-it-yourself solution for a single package registry. The
repository for the codebase has a Git branch (e.g. called `releases`). The
bundled output for the package will not be published to a registry service, but
as a new commit to this branch. That means the worktree content of this branch
is in fact the package content itself. For each release, there will a Git tag,
using semantic version syntax. Library users can install directly from the
public repository like this: `npm install
github.com:digitalservicebund/a2j-xjustiz-bridge#v0.1.0`. Dependabot is
supposed to be capable of understanding this and find new updates based on
version tags and included `package.json` files.

- Good, because it doesn't need a package registry, just the repository itself.
- Neutral, because it requires a more complex release pipeline setup.
- Neutral, because it is more privately and directly attached to the repository.
- Neutral, because this works with any Git repository hosting service.
- Bad, because it is not idiomatic and can cause friction for library users.

## More Information

We gonna follow the company [internal guidelines](https://digitalservicebund.atlassian.net/wiki/x/agAtg)
to publish to the NPM registry. That means the package is gonna be called
`@digitalservicebund/a2j-xjustiz-bridge`. As soon as we have our basic
package set up, an administrator of the company will enable our release workflow
on GitHub Actions to make the OpenID Connect authentication work.
