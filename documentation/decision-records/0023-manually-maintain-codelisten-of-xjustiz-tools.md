---
status: accepted
date: 2026-07-23
decision-makers: Thore Straßburg, Pram Gurusinga
---

# Manually Maintain Codelisten of XJustiz-Tools

## Context and Problem Statement

We made the [decision to integrate with the
XJustiz-Tools](./0014-integrate-with-xjustiz-tools.md) as a service. As pointed
out in this decision, we have a private wrapper repository for the XJustiz-Tools
that we use to prepare and bundle the service as an OCI image to be deployed in
our infrastructure.

The XJustiz standard has the concept of so called Codelisten. These are
basically fixed lists of possible code values with description — like an
enumeration. Type 3 of these Codelisten makes them independently versioned from
any schema. The sender of an XJustiz-Nachricht is obliged to specify the version
in use.

The service of the XJustiz-Tools have the feature to automatically pull all
Codelisten that are referenced in the XJustiz-Standard from the XRepository.
Codelisten are downloaded once during initial startup and will be updated based
on a configured interval automatically in background. The latter can be also
turned off. The Codelisten are stored as plain files on the local filesystem.

It is partially tough to know the exact behavior of the service, because the
logging is inconsistent across multiple runs, and the documentation not detailed
enough. Based on reverse engineering the initial download of the Codelisten can
be basically skipped, if all Codelisten are available at startup.

From conversations with people working on the receiving end for
XJustiz-Nachrichten, it is known that the update cycles of Codelisten can be
challenging to keep up with. This, and to keep also the integration with the
service stable and predictable, raises the requirement to control the Codelisten
used by the service.

Furthermore, the XJustiz-Tools are directly exposed to plain user data, sent to
their API endpoints. Therefore, it is important to have the infrastructure
around this service secure and locked down. In best case, the service has no
network egress and strict ingress control for the API, not publicly exposed.

How should we configure and run the XJustiz-Tools service in our infrastructure
in regards of automatic Codelisten updates?

## Decision Drivers

- Deterministic behavior
- User data protection

## Considered Options

- Manually Maintain Codelisten
- Default Behavior with Automatic Updates

## Decision Outcome

Chosen option: "Manually Maintain Codelisten", because this gives the most
control. It gives us trust in the integration between XJustiz-Bridge and
XJustiz-Tools. Furthermore, it is likely the securest way to run the service for
data protection.

### Consequences

- Good, because updates of Codelisten are manually controlled
- Good, because it is explicitly known which Codelisten are used and when
- Good, because updating Codelisten is part of the regular deployment process
- Good, because the service can run offline with just restricted internal access
- Neutral, because the service isn't fully used as intended
- Bad, because updates are done manually without a proper automation on an unknown schedule

## Pros and Cons of the Options

### Manually Maintain Codelisten

That means we have the Codelisten downloaded in our schedule, put them under
version control in the private wrapper repository, and bundle them directly with
the OCI image. The configuration option to turn off automatic updates is set.
The service gets deployed with network policies that disallow any outgoing
connections.

- Good, because it is explicitly known which Codelisten are used
- Good, because updating Codelisten is part of the regular deployment process
- Good, because the service can run offline with just restricted internal access
- Neutral, because the service isn't fully used as intended
- Bad, because updates are done manually without a proper automation on an unknown schedule

### Default Behavior with Automatic Updates

We just run the service without further ado, have it download the Codelisten on
startup and have it update them automatically on the default (or customized)
schedule.

- Good, because no extra work
- Good, because the OCI image is a bit smaller
- Bad, because updates happen uncontrolled and can break integration
- Bad, because the service needs external network connections.
