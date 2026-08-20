---
status: proposed
date: 2026-05-22
decision-makers: Thore Straßburg, Pram Gurusinga
---

# Use Pnpm as Package Manager for Runtime Dependencies

## Context and Problem Statement

The TypeScript library for the XJustiz-Bridge will need some runtime
dependencies for production as well as testing. Furthermore, the library itself
will be published to a package registry as well. That means we need
a development platform-specific package manager. It will be complementary to the
already established development environment we have set up.

For the current scope, there will only be a single package. No further internal
packages are expected with the current architecture. This makes workspace
handling less of a factor. However, it might become a requirement in future.

Which package manager should we use to manage runtime dependencies?

## Decision Drivers

- Fast dependency installation for local work and continuous integration pipelines.
- Sensitive defaults for supply chain security.
- Effective workspace handling.

## Decision Outcome

Chosen option: "pnpm", because it has proven as fast and secure package manager
within the Access to Justice project.

### Consequences

- Good, because of the good developer experience to manage dependencies.
- Good, because we should be partially more protected against supply chain attacks.
- Good, because workspaces are known to work well, if should gonna need them.
- Neutral, because it can publish to the NPM package registry.

## More Information

Given our central workflow orchestrator, we deliberately do not intend to use
`scripts` within any `package.json` and run them via `pnpm` or different package
manager.
