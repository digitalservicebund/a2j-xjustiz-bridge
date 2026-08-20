---
status: accepted
date: 2026-05-22
---

# Use Ky as the HTTP Client

## Context and Problem Statement

We are building the XJustiz-Bridge as a TypeScript library for integrating
with the XJustiz-Tools and handling sensitive user data. While the current
focus is on Node.js environments, we want to keep the implementation
platform-agnostic so that browser support stays a viable option for the
future, as required by the Onlinedienste.

We need an HTTP client that provides strong TypeScript ergonomics out of the
box, including typed error handling, retries, and timeouts, without introducing
a significant supply-chain risk or bundle-size cost for consumers.

The zero-dependency baseline is native Fetch. However, it does not provide
built-in retries, timeouts, or the same level of error-handling convenience, so
it would require additional wrapper code.

Which HTTP client should be used for the library's networking layer?

## Decision Drivers

- Built-in retry support
- Minimal bundle-size impact for consumer web applications
- Minimal supply-chain risk
- Universal compatibility: must work in modern browsers and in the same Node.js
  versions as the Onlinedienste

## Considered Options

- Ky
- Native Fetch
- Axios
- Got
- Undici

## Decision Outcome

Chosen option: "Ky", because it provides the best balance of developer ergonomics,
TypeScript type safety, and built-in resilience features while keeping supply-chain
risk minimal.

### Consequences

- Good, because built-in retry handling improves resilience during network
  failures
- Good, because Ky's small footprint minimizes additional bundle-size impact for
  the Onlinedienste
- Good, because it is actively maintained and has strong alignment with web standards
- Good, because zero transitive dependencies keeps security and
  supply-chain risk minimal

## Pros and Cons of the Options

### Ky

[Link to GitHub project](https://github.com/sindresorhus/ky)

- Good, because it includes built-in retry and error-handling features
- Good, because it is built on top of the native Fetch
- Good, because it has response validation with Standard Schema
- Good, because it is actively maintained with strong standards alignment
- Neutral, because it adds one direct dependency to the project

### Native Fetch

- Good, because it is a zero-dependency, zero-bundle-size option
- Good, because it has excellent long-term stability as a web standard
- Bad, because it requires custom wrapper code for timeouts, retries, and typed
  errors
- Neutral, because HTTP error handling must be implemented manually and does not
  automatically throw on 4xx/5xx responses

### Axios

[Link to GitHub project](https://github.com/axios/axios)

- Good, because it has a large ecosystem and is widely familiar
- Bad, because it has a significantly larger bundle size
- Bad, because it experienced multiple high-severity issues in 2026
- Bad, because its dependency graph increases supply-chain risk

### Got

[Link to GitHub project](https://github.com/sindresorhus/got)

- Good, because it has advanced built-in retry support
- Good, because it has strong TypeScript support
- Bad, because it is Node.js-only; browser environments are not supported,
  which violates the universal compatibility requirement
- Bad, because it has a larger dependency footprint
  (12 transitive dependencies)

### Undici

[Link to GitHub project](https://github.com/nodejs/undici)

- Good, because it supports configurable retries for resilient network requests
- Good, because it offers the highest throughput and lowest latency for Node.js
  backends
- Good, because it has zero external dependencies and is maintained by the
  Node.js TSC
- Bad, because it is Node.js-only; browser environments are not supported,
  which violates the universal compatibility requirement
