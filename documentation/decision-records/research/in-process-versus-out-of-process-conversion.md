# In-Process versus Out-of-Process Conversion

## Problem Statement

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
a library that Onlinedienste compile against directly (in-process). This
document evaluates both approaches against the product requirements and
organizational context.

## The Conversion Problem: A Layered View

Regardless of whether the bridge is implemented as a service or a library, the
same fundamental work for a conversion must be performed. This work can be
decomposed into multiple layers of responsibility. Based on current analysis,
with focus on the later assessed requirements of correctness, four layers can be
identified. Understanding these layers helps to clarify where each approach
differs and where they don't.

The XJustiz standard supports a huge variety of real world scenarios, even
within a single Fachmodul. Therefore, lower layers create a strong but generic
foundation. Upper layers focus more on specific use cases. The goal is to
control the complexity and guide the composition of XML documents that make
valid XJustiz messages.

**Layer 1 - Low Level Schema Foundation**
The underlying capability to model XSD schema components like complex types,
datatypes with restrictions, element composition, cardinality etc. It provides
a mechanism to define schema representations, creating compatible document
instances and serializing them.

**Layer 2 - Schema Representation**
A translation of the XJustiz schema from their official XML representation
format into the implementation language representation based on Layer 1. This
includes the top level Fachmodule, the Grunddatensätze, Codelisten, DIN Norm
etc.

**Layer 3 - Use Case Specification**
The specification narrows down the full schema from level 2 to a specific
scenario (like Fluggastrechte or Geld Einklagen). This reduces the complexity
and determines the exact requirements, including the object relationships and
identity constraints that must be enforced during composition. This also takes
into account the applicable Schematron rules for this scenario.

**Layer 4 - Orchestration**
The orchestrator provides a Domain Specific Language (DSL) to the caller. It
threads identities to ensure there are no dangling references. It accumulates
the document structure based on the Layer 3 specification to ensure everything
fits together. Local translation logic between the data models will happen
within the orchestrated composition (e.g. mapping or splitting data, branching,
etc.).

The goal is to use type-driven-development with declarative assembly, making
invalid state irrepresentable. Missing or wrongly typed data compositions will
be caught at compile time by one of the layers. That includes the enforcement of
invariants or other constraints by the compiler. Despite the language choice,
the type system won't be able to express all constraints. However, following
a "parse don't validate" principle allows defining clear boundaries. Especially
for dynamic user input, the points for possible errors must be explicit and can
be handled directly by the Onlinedienste, allowing for runtime recovery.

Both approaches will need to implement all layers in one way or the other. The
key difference is what sits on top: the interface that will be consumed by the
Onlinedienste.

### The Conformist Relationship

The XJustiz standard imposes constraints that reach beyond the conversation
itself. Restrictions on character sets, mandatory fields and cross-field
constraints can not be resolved by raw translation. For example, if a field in
XJustiz is required to be of "Datatype A" from the DIN norm 91379 (which
basically restricts a string to Latin only characters), users must not enter
characters not allowed for this datatype. This should be directly integrated
into the user input forms. The bridge can't silently drop nonconforming
characters. This is a not a limitation of the bridge, but a legal constrain
enforced by the standard. From the perspective of domain driven development,
this is a conformist relationship. XJustiz is sovereign and the Onlinedienste
just capture data that conforms to the standard.

This has practical consequences for both approaches. Regardless of which
approach, the Onlinedienste need to adapt partially to meet XJustiz constraints.
The library communicates these requirements directly and explicitly. The
service communicates them via documentation and fails at runtime, if they are
not met. However, the actual size of this gap is currently uncertain and will
vary per use case. Early pilot work must assess this.

### How the Approaches Diverge at the Interface

**In-Process Library**
Layer 4 can be the direct API surface. The developer writes against the use
case specific orchestrator. It exposes the strongly typed DSL and guides the
developer to compose a correct document with all constraints. The translation
logic is just native code within these assisting boundaries. Alternatively, the
orchestrator can expose a highly use case optimized and flat interface, if that
should be desirable.

The data flow relies primarily on data parsing and static compile time
evaluation. The library can provide validation schemas compatible with Zod,
which the Onlinedienste already use for user input validation. This enables
seamless integration at the form level with the schema itself, addressing the
conformist relationship.

**Out-of-Process Service**
A service must put an additional layer on top, with the API contract
describing what the caller must send via network. This introduces a shared data
model between the service and the Onlinedienste. This model must be
designed, documented, versioned, and maintained as a separate artifact. The
critical question is what this model looks like and how it evolves. After all,
the data model will likely be less capable to carry all restrictions than
a programming language native data model. This also splits the translation logic
between the service and some kind of adapter in the Onlinedienste.

The additional layer requires a translation of the native Onlinedienst data
model to the data transfer model of the API contract before it gets serialized.
The service must unpack this into an intermediate data transfer model as well,
before it can parse it into its native data model of Layer 4. This intermediate
process is error prone and can lead to unrecoverable runtime errors. It creates
a weak link on top of an otherwise strong conversion chain. The additional
parsing layer is only necessary because the network boundary breaks the type
chain. It compensates for lost compile time safety with additional runtime
validation.

### A Note on the Implementation Language

#### XML Support

Certain programming languages can have an advantage at Layers 1 and 2, given
their platform's mature XML and XSD tooling. For example, the JVM (Java Virtual
Machine). Also for an in-depth production runtime validation, platforms vary in
XSD schema and Schematron validation capabilities. The `libxml2` C library is
a strong Open Source implementation that can be bound into various programming
languages. However, integrating these bindings is less frictionless compared to
platforms with native XML support, such as the JVM. The vulnerability history of
`libxml2` is also notably larger and requires attention. Production runtime
in-depth validation is an open discussion point with a trade-off between
multiple requirements.

An analysis of the XÖV Standardisierungsrahmen has shown that it uses only
a specialized subset of the full XSD specification with predictable patterns,
due to its fixed toolchain. Only a well-defined subset is in use, which tends to
be the straightforward parts of the specification. Furthermore, the specific
XJustiz standard and it's Fachmodule are much broader than the supported use
cases by the Onlinedienste. SDKs supporting Layer 1 and 2 often implement the
full XSD specification. Their code generation typically produces complete schema
bindings, regardless of how much is actually used.

Research prototypes have shown that custom XSD support is feasible without
extensive effort. The translation from the XML to language-native schema
representation can be partially supported by AI coding agents. It might even
allow stronger encoding of constraints and invariants. For example, identity
constraints. This alleviates the lack of XML support by a platform and allows
for the potential choice of a more expressive programming language.
Additionally, a manually maintained schema representation can carefully
incorporate constraints from Schematron rules directly. For example, rules that
further restrict elements beyond what the XSD schema specifies for certain
Fachmodule. For example, cardinality or enumerations. Generated bindings from
generic tooling cannot account for these cross-cutting rules, as they operate on
XSD alone.

Finally, stronger platform support for Layers 1 and 2 does not resolve the
interface problem on top of Layer 4. The conversion chain is only as strong as
its weakest link.

#### Type-Driven Development

The core conversion in the Layers 1-4 benefit a lot from the type-driven
development. It allows for the compile time guarantees this approach aims for.
Especially the important layer 3 needs secure subtype verification and type
structural derivation. To do so, this requires some degree of type-level
computation. Nominally typed programming languages tend to struggle here, in
contrast to structurally typed ones. Also algebraic, literal and anonymous types
provide enormous advantages to maintain a secure conversion type chain.

It is unlikely to find a platform with a programming language that has mature
XML support out of the box plus the capabilities for the desired type-driven
development. Therefore, a compromise is necessary. In regards of the preceding
analysis, and in perspective of the following requirement evaluation, the
type-driven development capabilities seem to provide more advantages for the
XJustiz-Bridge.

## Evaluation Against Requirements

The following evaluation maps both approaches against the requirements from the
product requirements document (Tech Enabler: XJustiz-Bridge, 27.01.2026).

### Validity & Runtime Failure Rate

> The failure rate of conversions that block users and can't be fixed at runtime
> MUST be significantly below 1%.
> The bridge MUST ensure that only valid XJustiz messages can be composed.
> The focus SHOULD be on the respective latest XJustiz version.

**In-Process Library**
Because the Onlinedienste compile directly against the library, the compiler
rules out a large group of issues. There is a clear boundary for dynamic user
input that must be parsed, much closer to the user interface with immediate
feedback. Structural mappings and constraint issues are caught during
development, even without tests. This eliminates a whole class of runtime errors
by design.
However, bug fixes in the library itself can't be deployed by the Court
Communication team itself, but requires a dependency update by the
Onlinedienste.

**Out-of-Process Service**
As pointed out in the earlier chapters, a service adds an additional layer with
a weak data model for network communication. This creates a runtime validation
boundary. If it fails, the Onlinedienste are unable to recover in many
scenarios. The user is blocked by an internal error or rather a bug. The <1%
target highly depends on the quality of the API contract, test coverage and
disciplinary work by the teams of the Onlinedienste. Moreover, typical network
fallacies increase the risk for runtime errors.
However, bugs in the service itself can be fixed and deployed directly by the
Court Communication team itself with immediate benefit for all Onlinedienste.

**Assessment**
Both approaches share the same core and produce the same base output quality.
The difference is primarily the input boundary. The library makes it easier to
catch errors at compile time. The service offers centralized operational
control, but has a higher risk of runtime errors.

### Imperative, Synchronous Interface

> The bridge MUST provide an imperative interface for synchronous
> request-response communication.

**In-Process Library**
Basically just a native function call.

**Out-of-Process Service**
A synchronous HTTP request-response call, would satisfies the requirement. But
the network introduces a few concerns the Onlinedienste must handle. These are
all standard concerns for service integration. They are solvable, but they
require additional work. Every concern is a potential source of failure,
unrelated to the actual conversion.

- Network and timeout issues with retry error handling
- Circuit breaker with potential fallback logic
- Request and response (de)serialization
- Endpoint configuration per environment with authentication

**Assessment**
Both approaches fulfill the requirement. The library does so in the most
straightforward way. The service adds a considerable amount of overhead due to
the network boundary.

### Low Latency

> The conversion SHOULD be finished within 3 seconds for the user. The
> duration MUST stay below an upper limit of 10 seconds. This complies best
> practices of the industry and matches science research.

**In-Process Library**
The library results in plain synchronous in-process execution which is expected
to finish quickly. Theoretically it could be argued that, because the
development platform is more restricted, it allows for less raw performance
optimization. Depending on whether conversion happens on the client or server,
the synchronous task blocks a full worker thread of the server, creating
scalability demands. However, this is expected to be no issue. The library
construct medium sized objects in-memory and serializes them into strings. The
Onlinedienste generate PDFs already in-process today.

**Out-of-Process Service**
The network round trip, serialization, and additional parsing add some time to the
raw conversion. When the messages don't become too big, it should be likely to
achieve the 3 second requirement. The upper limit of 10 seconds should be also
fine for normal network and load conditions. Some (production) benchmarking
should be established to monitor the behavior. The chosen development platform
could theoretically allow for performance optimization, with independent control
of computation resource scaling.

**Assessment**
Both approaches should be able to fulfill the requirement. The library should
have a large margin and is expected to convert in milliseconds. The service
comes with a lot of additional infrastructure overhead like network latency.

### Developer Experience

> The developer experience for the teams of the Onlinedienste MUST have
> priority to provide relief. The "Time To First Hello World" (TTFHW) SHOULD be
> below 10 minutes. The "Time To First Value" (TTFV) can be more complex but
> SHOULD be within 1-2 days.

**In-Process Library**
Onlinedienste install the library as dependency using their package manager. The
bridge can be imported directly for the respective use case. Autocompletion
is directly supported and the compiler provides immediate feedback on errors.
The developer writes ordinary code within guided boundaries. The documentation
is directly available and provided Zod schemas can be integrated into the UI.
The teams of the Onlinedienste will need to become familiar with the interface
and provided DSL.
TTFHW and TTFV are both realistic, depending on the complexity and size of the
use case.

**Out-of-Process Service**
Onlinedienste implement some kind of adapter to integrate the service. After
reading the API documentation, service endpoints get configured and the data
transfer model will be created. Certain schema constraints like restrictions on
character sets must be integrated into the user interface. Structural mappings
need careful reading and intensive contract testing. Furthermore, there must be
some logic to handle the different response errors. Timeouts and other
network issues must be handled respectively as well. Finally, a matching test
setup must be found.
TTFHW could be achievable without too much extra time. TTFV seems challenging.

**Assessment**
Both approaches can deliver good developer experience. The library provides
direct IDE integration and compiler guidance, providing real-time feedback
during development. The time targets are likely to be achieved. Service
integration is a common pattern, but depends primarily on good documentation and
requires more work. Time targets are less likely to be achieved.
Finally, it must be said that both approaches might suffer under the uncertainty
of the conformist relationship. That means how far off is the model of the
Onlinedienste from XJustiz. How much can be taken care of by translations during
the conversion and where is a gap that must be resolved in the domain of the
Onlinedienste to become conform.

### IT Security & Data Protection

> The bridge MUST be IT-Grundschutz and DSGVO conform, with respective
> concept documents.

**In-Process Library**
The data stays within the boundary of an Onlinedienst. No additional security or
data protection concepts and measurements should be required.
The library approach could even allow for client side conversion, which is
interesting in regards of lawyers duty of confidentially of client data
(Mandantengeheimnis).

**Out-of-Process Service**
Sensitive legal data transverses the network and must be secured accordingly.
The additional data processing component needs to be access controlled. Existing
security and data protection concepts must be extended.

**Assessment**
Both approaches can become compliant. The library avoids almost any adaptions.
The service requires modest documentation and measurements. However, the data
transparency issue defines the highest risk that needs further assessment.

## Dimensions Beyond the Requirements

The following sections examine additional engineering dimensions that affect the
longtime viability and operational costs of each approach.

### Update Scenarios & Centralized Control

One major benefit of services is the centralized control by the managing team.
Bug fixes and features can be deployed once and all consumers benefit
immediately. This must be evaluated in the context of the actual problem and an
organization's practices and culture.

#### What Actually Triggers an Update of the Bridge?

**XJustiz Standard Version Updates**
The standard currently changes every year. New releases are announced early and
the organization is partially involved in the development of new versions.
Both approaches, the library and the service, require adaption of the
Onlinedienste, if the changes in the version affected their use case. A new
version of the standard changes either the service API or the libraries
orchestrator interface. Neither approach avoids this work and some coordination
is required.

**Bug Fixes and Vulnerabilities in the Core Conversion Logic**
This is where both approaches differ the most. Assuming the API keeps stable,
the service just gets deployed a new version by the Court Communication team
with immediate benefit for all consumers.
The library requires the Onlinedienste to update their dependency and make a new
deployment themselves instead. However, with semi-automated dependency updates,
especially for patches, and continuous deployment pipelines in place, this
becomes less of an issue. Because the library should have near zero external
dependencies and no network surface, urgent vulnerability patches are expected
to be rare.

**Breaking Changes**
This can also happen for XJustiz major version updates. Both approaches cause
friction. The service requires API versioning with expand-and-contract
coordination, sunset periods and parallel version operation.
The library would publish a new major version itself. The teams of the
Onlinedienste adapt on their own timeline, giving them more control.

**The Monorepo Question**
If the library lives in the same mono repository as the Onlinedienste,
a single-version policy could be applied. Every library change has to update all
Onlinedienste too. This provides similar benefits to the service, but creates
stronger coupling. This is an open design decision to take.

### The API Contract Divergence Problem

As already established, the service requires an API contract, using a data model
shared with the Onlinedienste. This model is less capable than a programming
language's native type system at expressing the full range of constraints.

Such model must not just mirror XJustiz, else the bridge would be useless.
Instead, the model should be developed closer along the domain model of the
Onlinedienste. Though, certain constraints like restrictions on character sets
can't be dissolved.

However, any shared data model between two independently evolving systems is
subject to drift. The API contract sits between the Onlinedienste their internal
domain model and the XJustiz standard. Both evolve on their own timelines. The
Onlinedienste evolve their domain model as the product develops. This diverges
with every product iteration and creates a third data model that lags behind. It
will require mapping and translation logic on the side of the Onlinedienste.

With the library, there is no shared data model that drifts. The Onlinedienste
map directly from their current domain model to the orchestrator. When their
model changes, they update their mapping code locally, with compiler guidance.
When the library publishes a new version, the compiler tells the teams of the
Onlinedienste exactly what needs to change, when they update their dependency.

### Output Validation

Both approaches execute the same Layers 1–4 to produce XML. Both can validate
that output against the actual XSD and Schematron rules as a safeguard against
bugs in the conversion logic itself. This validation can be used only within
tests or in production on every conversion, if the latency budget allows it.
An alternative approach would be to return the converted XML immediately and
verify it asynchronously for monitoring to detect issues. The choice when and
how to run output validation is a quality assurance decision.

That said, it has already been pointed out that the service allows for a wider
choice of platforms to obtain better XML support. The library is more restricted
in that sense and might be more limited in options to assure output quality in
production, if that should become required.

### Testing

Both approaches require the same test strategy for the core conversion logic
itself. Among others, these will include property tests, golden baseline tests,
negative compile tests, and output validation against the public schemas. The
difference is how the Onlinedienste test their integration with the bridge.

**In-Process Library**
The integration itself are function calls. The compiler takes care of their
correctness. The semantic correctness of the mapping logic is left to test,
which should become unit tests. The real orchestrator can be called directly in
the tests. It is fast, deterministic, and in-process. It worst case it even
allows for direct debugging.
However, when Zod schemas are used, there is no single integration point
anymore. Arguably this creates no friction for testing.

**Out-of-Process Service**
There is a clean integration boundary with the service adapter, decoupling the
network endpoint. The Onlinedienst can have focused integration tests for
various aspects here. However, this requires either a development instance of
the service or a maintained mock. Keeping the latter in sync with the real
service's behavior is additional ongoing effort. The API contract compliance
takes extra effort to test.

### Observability

The service approach allows for centralized observability across all
Onlinedienste. The Court Communication team can collect conversion metrics
directly.
For the library this is more complicated, because it requires setup by and
alignment with the Onlinedienste.

### Expandability

The library allows to continuously add new Fachmodule and update to new XJustiz
versions cheaply. Onlinedienste can update on their own timeline. They only
depend on what they need, and potentially even benefit from techniques like
tree-shaking.
The service API could become more complex, versioning potentially different
XJustiz versions per Fachmodul for the different Onlinedienste.

### Reversibility

The library can be wrapped behind a network endpoint, becoming a service itself.
However, it must use a platform compatible with the programming language of the
library. The teams of the Onlinedienste will have to create a service as already
described.
Converting the service into a library, and strip the network endpoints, only
works out if the original programming languages of the service can run on the
platform of the Onlinedienste. The service adapter can be replaced with direct
orchestrator interactions.
Both directions are possible, but cost time and effort. The service might not be
reversible if the platforms are incompatible. Furthermore, the examined
advantages of the initial programming language choice can't be claimed anymore.

### Maintainability

The library approach is strongly based on top of a strict conversion logic
around Layers 1-4. This is the foundation of multiple arguments where the
library shines in contrast to the service, supporting a strong shift-left
paradigm down to the type system. This requires expertise in type-driven
development and type-level computation. The initial work, plus good
documentation, should allow for good maintainability, using established
patterns. However, this is a serious shift in engineering skills.
The service depends on runtime errors for the API model parsing, but also the
network connection itself. There must be a strategy how to respond with errors
that can be properly handled by the Onlinedienste. For example, to map parsing
errors back to user inputs. But there must be also a user flow when the service
is unavailable or conversion fails due to API caller issues.

### Operational Cost

The library requires to publish some artifacts or using a mono repository setup
with a single-version policy.
The service requires a full infrastructure setup. The Court Communication team
needs to maintain infrastructure as code, continuous deployment pipelines,
security measurements, reliability engineering, compatibility management etc. It
creates a single point of failure for Onlinedienste.

### Security Surface

The library has a small surface, because it doesn't have any infrastructure
dependencies. But if a `libxml2` integration should be used in production,
this significantly increases memory vulnerabilities.
The service has a network interface that must be secured. It will require
authentication, authorization, rate limiting, input size limits, etc. All
standard but nonzero concerns.
Taken the sensitivity of the data into account, less surface is theoretically
better.

## Summary

In-Process Library:

- (+) strong compile time validity
- (+) low effort operation without infrastructure
- (+) small security surface
- (+) low latency
- (+) guaranteed availability
- (+) arguably great developer experience
- (+) more actionable handling of parsing errors (e.g. Zod integration)
- (+) teams of Onlinedienste can update on their own timeline
- (-) restricted platform choice with poor native XML support
- (-) centralized monitoring setup much complicated
- (-) unloads resource scaling to Onlinedienste

Out-of-Process Service:

- (+) immediate and independent hot fix deployments
- (+) free choice of platform (e.g. strong XML support, type-driven development)
- (+) more options for production runtime validation
- (+) straightforward, centralized monitoring setup
- (+) potentially less engineering skills required
- (-) depends on runtime errors
- (-) requires API contract modeling and maintenance
- (-) much more backwards compatibility effort
- (-) additional network latency
- (-) possibility of availability issues that must be handled
- (-) higher operational costs with own infrastructure
- (-) arguably less optimal developer experience with more integration work
- (-) larger security surface

## Open Discussion Points

- Necessity of production runtime validation
- Publishing artifacts or using mono repository with single-version policy (library only)
- Client or server side conversion (library only)

## Proposal

Use the library approach, but evaluate risks early. Switch to the service
approach as early in the process as possible, when critical issues are
discovered. Therefore, take the first specific use case of the Onlinedienste as
driver for the conceptional work, applying the ideas described in this document.

Start to explore Layer 3 for the exact first scenario to create a narrow use
case specific schema. That includes inspection of the Onlinedienste their domain
model to get an idea of the translation gap.
This work should be done without code in first place and must be done without
investing the effort to develop Layer 1-2 first. Given a full understanding of
Layer 3, the requirements for the orchestrator should be developed to form the
API.

Use a README-driven development approach (or document-driven development in
a wider sense) to focus on API first with the developer experience in mind. This
will act as an artifact for the Court Communication team internal alignment and
evaluation as well as for "developer research" with the teams of the
Onlinedienste, establishing early feedback cycles. This can also help to support
the adoption of the progressive disclosure pattern for agents in later stages of
the project.

Use the tracer bullet strategy and create a walking skeleton for a minimal
functional slice. In collaboration with the team of the respective Onlinedienst,
integrate this mock-like implementation behind a feature flag and deploy it to
production. This helps to verify the end-to-end journey. It tests the developer
experience early and ensures the integration works as intended.

Create a test harness that includes actual XSD schema and Schematron validation
for the final output. It should be attempted to implement it in a way that
theoretically allows running it in production as well.

After each phase, risk factors should be evaluated. However, for the initial
work both approaches don't vary too much up to the tracer bullet. After all
described phases, plus the initial research prototypes, there should be enough
knowledge and trust gained to commit to the architecture or not.
