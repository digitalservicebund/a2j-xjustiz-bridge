---
status: accepted
date: 2026-04-13
decision-makers: Thore Straßburg, Kai Bernhard, Flo Drews, Manuel von Struckrad
informed: the whole Access to Justice project
---

# Using a Dedicated Repository

## Context and Problem Statement

The new Court Communication (complication subsystem) team needs a code repository
to develop its products. There are at least two products that will be developed
by this team:

1. The XJustiz-Bridge to compose XJustiz messages, consumed by all
   Onlinedienste via the Platform team and probably the Kompla team as well.
2. The ERV Orchestrator as an integration service, consumed by all Onlinedienste
   via the Platform team.

Both are related as part of the ERV (electronic legal communication) but
are separate bounded contexts. Each product might use a different tech stack,
addressing the individual requirements. Based on current knowledge, the products
don't depend on each other.

The Platform team owns the
[a2j-rechtsantragstelle](https://github.com/digitalservicebund/a2j-rechtsantragstelle)
repository with all Onlinedienste for RAST (court legal application office) and
ZOV (online civil proceedings). It is in production and is composed as
a modulith using a single tech stack for web development.
The Kompla team owns the
[a2j-kommunikationsplattform](https://github.com/digitalservicebund/a2j-kommunikationsplattform)
repository, which explores a modern alternative solution for the ERV.
The products by the Court Communication team are consumed by both teams, though
the relationship to the Platform team is stronger. The ERV Orchestrator might
just be a temporary solution, depending on the success of the
Kommunikationsplattform.

In which repository should the Court Communication team and develop its products?

## Decision Drivers

1. Repository boundaries should align with team ownership
2. X-as-a-Service as target interaction between teams
3. Complicated subsystem team should reduce cognitive load for other teams
4. Internal cohesion based on domain context boundaries
5. Conway's Law shapes communication patterns and architecture

## Considered Options

- Inside the Platform or Kompla Their Repository
- One Repository Per ERV Product
- One Repository for All ERV Products

## Decision Outcome

Chosen option: "One Repository per ERV Product", because it encourages to treat
each product separately and gives the Court Communication team an independent
working environment. The polyrepo approach feels like a sensible default for the
given context. There are no notable risks with potential high impact.

### Confirmation

The actual relationship and interaction modes with the other teams will show if
the separation of the XJustiz-Bridge as X-as-a-Service works out well in
production. Depending on if the Kompla team will actually use the bridge, and if
there is constant collaboration necessary, a joined mono repository might become
more relevant.

## Pros and Cons of the Options

### Inside the Platform or Kompla Their Repository

All ERV products live in subdirectories of the `a2j-rechtsantragstelle`
repository by the Platform team (monorepo). A similar argumentation applies for
the integration into the `a2j-kommunikationsplattform` repository by the Kompla
team, though the relationship is unclear.

- Good, because it provides direct integration into Onlinedienste with atomic changes
- Good, because it avoids potential diamond dependency issues.
- Bad, because the relationship is asymmetric to the Platform and Kompla teams
- Bad, because Conway's Law pushed the ERV products to become part of the platform
- Neutral, because the `a2j-rechtsantragstelle` repository isn't prepared to become a monorepo and requires additional work

### One Repository Per ERV Product

All ERV products live in separate repositories owned by the Court Communication
team (polyrepos).

- Good, because it provides a context boundary per product
- Good, because it reinforces the X-as-a-Service relationship
- Good, because the Court Communication team gains autonomy
- Neutral, because it marginally increases the cognitive load
- Bad, because it doesn't allow for a uniform toolchain and configuration by the team

### One Repository for All ERV Products

All ERV products live in a single repository owned by the Court Communication
team (monorepo).

- Good, because it matches team boundaries
- Good, because it reinforces the X-as-a-Service relationship
- Good, because the Court Communication team gains autonomy
- Good, because is allows for a uniform toolchain and configuration by the team
- Neutral, because the products are independent of each other without extra gains

## More Information

This decision was discussed and taken before the creation of the repository this
records resides in.
