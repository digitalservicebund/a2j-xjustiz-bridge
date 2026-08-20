---
status: accepted
date: 2026-04-20
decision-makers: Thore Straßburg
consulted: Kai Bernhard, Flo Drews, Pram Gurusinga
---

# Implement the XJustiz-Bridge as Library

## Context and Problem Statement

The Access to Justice Onlinedienste collect structured user data through guided
web forms. To participate in the electronic legal communication (ERV), this data
must be converted into messages conforming to the public XJustiz standard.

XJustiz is a quite complex XML standard with deeply nested schemas, dozens of
versioned code lists, string types with restricted character sets, cross-field
identity constraints, and Schematron business rules. The conversion is
nontrivial and can be error-prone.

The Court Communication team is a dedicated complicated subsystem team
responsible to enable the teams of all Onlinedienste to produce XML documents,
that are valid XJustiz messages without becoming XJustiz domain experts
themselves. Therefore, the XJustiz-Bridge should be provided.

Two fundamental approaches exist for the XJustiz-Bridge: Hosting a separate
service that Onlinedienste call remotely (out-of-process), or providing
a library that Onlinedienste compile against directly (in-process). Some
[supportive research](./research/in-process-versus-out-of-process-conversion.md)
evaluates both approaches both in more depth and acts as foundation for this
decision.

Should the XJustiz-Bridge be implemented as a service or a library?

## Decision Drivers

Driving decision follow directly from the [product requirement document](../product-requirements.md)
and got evaluated throughout in the related research document. Relevant
requirements for this decision are:

- The bridge MUST ensure that only valid XJustiz messages can be composed.
- The focus SHOULD be on the respective latest XJustiz version.
- The bridge MUST provide an imperative interface for synchronous
  request-response communication.
- The conversion SHOULD be finished within 3 seconds for the user. The duration
  MUST stay below an upper limit of 10 seconds. This complies best practices of
  the industry and matches science research.
- The developer experience for the teams of the Onlinedienste MUST have priority
  to provide relief. The "Time To First Hello World" (TTFHW) SHOULD be below 10
  minutes. The "Time To First Value" (TTFV) can be more complex but SHOULD be
  within 1-2 days
- The bridge MUST be IT-Grundschutz and DSGVO conform, with respective
  concept documents.

## Considered Options

- Library (in-process conversion)
- Service (out-of-process conversion)

## Decision Outcome

Chosen option: "Library (in-process conversion)", because it allows for strong
compile time validity with reduced risk of runtime errors. It avoids network
fallacies, has low latency and requires no weak intermediate transfer model.
Furthermore, it doesn't require to maintain dedicated infrastructure.

### Consequences

- Good, because it encodes schema constraints directly into code with compiler support
- Good, because it can be used via direct function calls by the Onlinedienste
- Good, because the conversation happens quickly in the Onlinedienst without external dependencies
- Good, because developers of the Onlinedienste get support and feedback directly in their IDE
- Good, because data constraint can be wired directly into the user forms
- Good, because no extra system component processes user data
- Bad, because production runtime validation is more complicated if desired
- Bad, because monitoring performance indicators is trickier

## Pros and Cons of the Options

### Library (in-process conversion)

- Good, because it provides strong compile time validity
- Good, because it is low effort operation without infrastructure
- Good, because has a small security surface
- Good, because is supports low latency
- Good, because it provides guaranteed availability
- Good, because it arguably provides a great developer experience
- Good, because it allows for more actionable handling of parsing errors (e.g. Zod integration)
- Good, because teams of Onlinedienste can update on their own timeline
- Neutral, because it unloads computation resource scaling to Onlinedienste
- Bad, because the platform choice restricted with limited XML support
- Bad, because centralized monitoring setup is much more complicated

### Service (out-of-process conversion)

- Good, because it allows for immediate and independent hot fix deployments
- Good, because choice of platforms independent of the Onlinedienste (e.g. strong XML support, type-driven development)
- Good, because opens for more options to implement production runtime validation
- Good, because it is straightforward to set up centralized monitoring
- Good, because potentially less engineering skills are required
- Bad, because this approach depends on runtime errors
- Bad, because it requires API contract modeling and maintenance
- Bad, because it costs much more effort to achieve backwards compatibility
- Bad, because it has additional network latency
- Bad, because possible availability issues must be handled
- Bad, because it has higher operational costs with own infrastructure
- Bad, because it arguably provides a less optimal developer experience with more integration work
- Bad, because the security surface is larger
