---
status: accepted
date: 2026-05-28
decision-makers: Thore Straßburg, Pram Gurusinga
---

# Expose Standard Schema by Library

## Context and Problem Statement

In the schemata for the XJustiz standard, there are multiple scalar datatypes
that don't map to plain TypeScript types, but carry additional invariants.
Examples are the scalar for positive integers or the restricted characters sets
for the DIN norm 91379. Following our type-driven development, we use the "parse
don't validate" pattern. The parsing to construct valid instances of scalar
values creates an explicit and well-defined error boundary.

It should be as convenient as possible for users of the XJustiz-Bridge
library to work with these scalars. That means to integrate the parsing properly
into the flow of dynamic user inputs, especially for validation errors.

How can the scalars become more convenient to be used by library users?

## Decision Drivers

- Independent to the exact tech stack of library users
- Low effort for integration into input user flows

## Decision Outcome

Chosen option: "Standard Schema", because it provides a standard interface for
data validation that is supported by a long list of compliant libraries and
frameworks. The A2J Platform currently uses Zod schemas internally. Zod is
compliant with the standard and was even part of creating it originally.

[Link to the standard](https://standardschema.dev/schema)

### Consequences

- Good, because library users can integrate effectively with the scalars of the library.
- Good, because it is straightforward to fulfill the standard from the library perspective.
- Good, because the A2J Platform uses with Zod already a standard compliant schema library.
- Neutral, because customization of validation errors isn't addressed in the standard.
- Bad, because the customization of validation errors is a challenge general.

### Confirmation

It has to be observed how the usage turns out for the library users. Especially
the customization of validation errors is a critical point. Though, it should
not be a step into the wrong direction, but potentially needs an extension
complementary to the standard that allows for proper customization. There is
currently no idiomatic practice to handle this problem, just individual
solutions.

## More Information

The standard can be integrated by using their `@standard-schema/spec` package.
Though, it is completely optional and it is common practice to copy-paste the
interface.
