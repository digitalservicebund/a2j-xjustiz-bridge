# Architecture

Architecture decision records for the XJustiz-Bridge are administered in the
[documentation/decision-records](../decision-records) directory.

## C4 Model

The [a2j-architecture](https://github.com/digitalservicebund/a2j-architecture)
repository contains the overall system architecture of the encompassing Access
to Justice project. Among other documentation, it includes a C4 model with views
for the system context and containers. Complementary, there is a [focused C4
model](./c4-model.dsl) from the perspective of the
XJustiz-Bridge. Therefore, it includes only the level 2 container view plus
the level 3 component view of the library. The model is written in the
description language by Structurizr.

### Level 2 - XJustiz-Bridge Containers

The XJustiz-Bridge is primarily a TypeScript library (see [related decision
record](../decision-records/0012-implement-the-xjustiz-bridge-as-library.md))
that can be integrated by JavaScript based applications that need to compose
XJustiz messages. In practice, the Onlinedienste on the A2J platform are
currently the only users of the bridge. The library provides the
functionality that makes it as convenient as possible to compose standard
compliant messages with compile time guarantees.

Additionally, there is the service of the XJustiz-Tools (see [related decision
record](../decision-records/0014-integrate-with-xjustiz-tools.md)).
A third party product related to the XJustiz standard. The Court Communication
team is responsible to host this service for usage in the Access to Justice
project. Users of the library transitively depend on the service, that is used
internally to generate validated XML documents.

### Level 3 - Library Components

The library is the heart of the XJustiz-Bridge and primary interaction point.
The library is made up of the following components.

**XJustiz Schemata**
The foundation is the TypeScript implementation of the XJustiz schemata. This is
primarily a collection of advanced types that align with the JSON Schema of the
OpenAPI specification by the XJustiz-Tools. This schema is a translated version
of the official XJustiz schemata as XML Schema Definition. It is more
permissive and requires internal enhancement to provide enough compile time
guarantees. At the root are the so called XJustiz messages that are exchanged
within the _Elektronischen Rechtsverkehr_ (translation: electronic legal
traffic). The smallest building blocks are called scalars, implemented as
refined opaque types. They enforce the strict requirements of the DIN norm 91379
and similar datatype restrictions. Each scalar has a [Standard
Schema](https://standardschema.dev/schema) associated with it for better
application integration. Overall, the types representing the schema components
try to encompass as many invariants and Schematron rules as possible. For
example certain identity constraints are partially encoded here, using scoped
identity types. However, the schemata definitions are intentionally not
complete. The standard is extensive and the XJustiz-Bridge just projects what
is actually necessary for the Onlinedienste.

**Message Profiles** On top of the raw schemata, there are the message profiles.
They are narrowed conformance profiles of XJustiz messages for specific
application use-cases. They are based on the broadly defined messages in the
standard and restrict them to exact scenarios of the Onlinedienste. An example
is a _Zahlungsklage_ (translation: payment claim) which is based on the XJustiz
message of type `nachricht.klaver.klageverfahren.350001` in the standard.
A message profiles makes relevant optional data fields required. They limit and
partially even fix allowed values for certain data fields like on code lists.
They can also shape collections like the participants listed in a message,
requiring a minimal set of roles and allowing participants with optional roles
with enforced relationships. For example, a _Zahlungsklage_ always requires at
least a _Kläger_ (translation: plaintiff) and _Beklagter_ (translation:
defendant).

**Message Orchestrators**
For each message profile there is a message orchestrator. They complement the
profiles by taking care of invariants and identity constraints that can't be
properly expressed otherwise. For example, an orchestrator exposes the ability
to generate identities that are unique within a message and ensures there are no
dangling references to other entities within a message. It does so providing
a framework for the library users to compose a message, using object-based
security and controlled effect-patterns. In result they act as main entry point
of the library.

**Ergonomics**
In addition there are some convenience features to improve the ergonomics for
library users. The XJustiz standard can be partially verbose and messages become
big. With the message profiles and orchestrators focusing on correctness to
compose standard compliant messages with compile time guarantees, the ergonomics
help to reduce boilerplate code. Such include for example templates for common
data structures with sensible defaults that can be optionally overwritten. The
intend is to allow the library user to progressively disclose the complexity of
XJustiz messages. The ergonomics with its templates provide the second entry
point to the library and can be used optionally with the message orchestrators.

**Metatypes**
Underneath all of this, there are the metatypes. A collection of utility types
for type-level computation, supporting the type-driven development approach for
the other components. This includes a wide spectrum from common types like
`Invariant` or `IsAny`, over cosmetic `Prettify` types, to directly schema
related structures like `NTuple`s.
