---
status: proposed
date: 2026-05-23
decision-makers: Thore Straßburg, Pram Gurusinga
---

# Bundle the Library with Tsdown

## Context and Problem Statement

The XJustiz-Bridge is provided as a TypeScript library. Therefore, it must be
bundled and published to a package registry. The target group of library users
is known to internal teams working on the Access to Justice project. This limits
the needs for broad compatibility and allows for more stringent optimizations
(e.g. CommonJS versus ES modules). The library is expected to be consumed by an
application that brings its own bundler. In result compatibilities like
tree-shaking or minification have much less priority, as they are somewhat
expected to be taken care of upstream. However, the library will provide
a curated list of entrypoints that must be properly handled during bundling.

Which bundler should we use to package the library?

## Decision Drivers

- Correctness of TypeScript declaration files to ensure the compile time guarantees remain
- Support for multiple entrypoints
- Minimal setup and simplicity
- Future proof without the need for predictable toolchain switches

## Considered Options

- tsdown
- tsup
- Vite (library mode)
- Raw TypeScript Compiler

## Decision Outcome

Chosen option: "tsdown", because it has a clear focus on bundling TypeScript
libraries and emerges as modern convergence point in the ecosystem. It becomes
the backbone of some big popular projects like Vite itself. It is build on top
of Rolldown and OXC. The latter we already started to adopt in this repository.
Tsdown should allow us to stay ahead of the curve. After all it works basically
out-of-the-box and ticks all our requirements.

### Consequences

- Good, because it bundles our library effectively without much effort and setup.
- Good, because it has a strong focus on TypeScript and correctness of declaration files.
- Good, because it is strongly backed by the current development in the ecosystem.
- Neutral, because it allows us to add tree-shaking, minification and other features we might opt in.
- Neutral, because it creates a future proof foundation with plenty of capabilities like a plugin system.
- Neutral, because it adds another tool to chain.

## Pros and Cons of the Options

### Tsdown

[Link to project](https://github.com/rolldown/tsdown)

- Good, because it is specifically designed to bundle TypeScript libraries.
- Good, because it works with zero/minimal configuration.
- Good, because entrypoints can be defined and bundled properly.
- Good, because it has high performance and bundles packages fast.
- Good, because it emerges as new standard in the ecosystem.
- Good, because it is build on top of the strong Rolldown, OXC and TypeScript-Go projects.
- Neutral, because it is officially recommended as successor by tsup.
- Neutral, because it integrates with the Unplugin ecosystem.
- Neutral, because it has yet a smaller community.
- Bad, because the underlying Rolldown hasn't reached version 1.0 yet.

### Tsup

[Link to project](https://github.com/egoist/tsup)

- Good, because it bundles our library effectively without much effort and setup.
- Good, because it works with zero/minimal configuration.
- Good, because entrypoints can be defined and bundled properly.
- Good, because it has solid performance and bundles packages quickly.
- Good, because is widely adopted and proven in production.
- Neutral, because it is based on Rollup under the hood.
- Neutral, because for TypeScript it just bolts up with the TypeScript compiler.
- Bad, because it is officially not actively maintained anymore.

### Vite (Library Mode)

[Link to project](https://vite.dev/)

- Good, because it is dominant in the ecosystem and well established for production grade projects.
- Neutral, because it has actually a strong focus on web applications, not libraries.
- Neutral, because the majority of its features and strengths are not relevant for a library.
- Neutral, because it is itself powered by tsdown under the hood.
- Bad, because bundling TypeScript libraries properly actually requires additional plugins.

### Raw TypeScript Compiler

In fact just using the official `tsc` binary, no actual bundler.

- Good, because it is already in the toolchain, nothing extra needed.
- Good, because it is the same tool used to type check the codebase itself.
- Neutral, because entrypoints require no additional setup.
- Neutral, because it works on a per file basis and the output replicates the source structure.
- Neutral, because it fully depends on upstream capabilities for actual bundling features.
- Bad, because internals are publicly exposed in the output and theoretically accessible.
