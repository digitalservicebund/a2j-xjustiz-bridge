# XJustiz-Bridge

> Assisted composition of XJustiz messages that are ensured to be valid.

The XJustiz-Bridge is a component for the [Elektronischen
Rechtsverkehr](https://www.bundesjustizamt.de/DE/DasBfJ/Kontakt/Rechtsverkehr/Rechtsverkehr_node.html)
(electronic legal traffic), providing capabilities to compose legal messages
according to the [XJustiz](https://xjustiz.justiz.de) standard.

Valid messages in XML format can be composed using the
`@digitalservicebund/a2j-xjustiz-bridge` TypeScript library. With a strong
type system and type-level computations, it guides the library user to adhere to
the standard and compose messages that are valid based on compile-time
guarantees. This provides early feedback to engineers already during
development, without causing runtime errors that affect the end-user experience
in production negatively.

To learn more about the motivation, the scope, and approach of the
XJustiz-Bridge, read the [documentation overview](../README.md).

> [!IMPORTANT]
> The XJustiz-Bridge is heavily focused and developed primarily for the usage
> by the [Onlinedienste der Justiz](https://service.justiz.de) (online services
> for justice). It is part of the shared project [Zugang zum
> Recht](https://www.zugang-zum-recht-projekte.de/).

## Setup

### Installation

The library is published to the [NPM package
registry](https://www.npmjs.com/package/@digitalservicebund/a2j-xjustiz-bridge) and can be installed using any compatible package manager.

```sh
npm add @digitalservicebund/a2j-xjustiz-bridge
# or pnpm, yarn, ...
```

The library comes with rich IntelliSense support. Contextual hover hints,
autocompletion, and the compiler itself provide guidance directly in the editor.

### Runtime Environment Requirements

The library is in theory agnostic to the JavaScript runtime environment.
However, there is a strong focus on NodeJS as primary environment, used for
development, testing, and production. The following APIs are expected to be
available on the global context object (`globalThis`):

- `Intl.Segmenter` (for Unicode segmentation)
- `crypto.randomUUID` (for unique identifier generation, UUID v4 expected)
- `Temporal` (for calendar based scalars)

### TypeScript Configuration Options (Recommended)

The XJustiz-Bridge is built around a strong type system (more of this in the
section [A Word on Type Security](#a-word-on-type-security)). Multiple
constraints for composing correct messages are reported as errors by the
TypeScript compiler. These can become bulky and messages eventually get
truncated. This can be avoided by enabling the
[`noErrorTruncation`](https://www.typescriptlang.org/tsconfig/#noErrorTruncation)
option in `tsconfig.json` to preserve all details.

### Additional Glossary (Optional)

To further improve the experience, our glossaries can be set up to become
automatically accessible from within a code editor. Glossaries explain the
ubiquitous language and can help to understand the domain.

Glossaries are written in a format consumable by
[Contextive](https://contextive.tech). Installing the extension for a code
editor, it will automatically provide extra documentation context in hover
hints, everywhere code symbols contain terms found in the glossary.
Complementing the code documentation itself, this can help to work with the
XJustiz domain and the XJustiz-Bridge.

This requires to define a glossary file in the own (local) repository.

`xjustiz-bridge.glossary.yaml`:

```yaml
imports:
  - https://github.com/digitalservicebund/a2j-xjustiz-bridge/tree/main/xjustiz.glossary.yaml
  # or with fixed release tag matching the installed library version (e.g. version 0.2.0):
  - https://github.com/digitalservicebund/a2j-xjustiz-bridge/tree/v0.2.0/xjustiz.glossary.yaml
```

### A Word on Type Security

The library is built around a strong type system, following the approach of
type-driven development to provide compile-time guarantees for valid
XJustiz-Nachrichten. In that regard, it is important that library users **do not
work against the compiler**. Within the context of using the library, users
should strictly refrain from using the `any` type, using unsafe type assertions
(e.g. `as unknown as SomeStrictType`), or ignoring errors with annotations (e.g.
`@ts-expect-error`). Doing so means fighting against the library and risking
to produce runtime errors by incorrectly composed messages.

It is recommended to use strict linting rules to assist staying disciplined and
catch violations early. At least for the part of the codebase that interacts
with the XJustiz-Bridge. Such could be for example Oxlint rules (e.g.
[`no-explicit-any`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-explicit-any.html),
[`no-unsafe-type-assertions`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-type-assertion.html))
or their respective counterpart by ESLint.

## Usage

The following chapters provide an overview of what it needs to compose
a complete message. They teach the basic concepts of how the XJustiz-Bridge
works.

In complement to this, the library itself puts quite some effort into support
from within the development environment. The public interface is documented in
detail, provides examples, and links related resources. It is always worth
hovering a code symbol in the editor or to force code completion.

With type-driven development as foundation of the XJustiz-Bridge, compiler
errors are communicative. They express the required constraints and provide
hints how to fix the issue. TypeScript errors can sometimes be verbose and
tricky to interpret. However, in most cases a human readable text message should
be included.

### Find the Correct Message Profile

The XJustiz standard is developed around the concept of messages as primary
entity — so does the library. However, the XJustiz-Bridge defines more
messages than the XJustiz standard does. Messages in the standard often have
a broad scope and can be quite generic and open for interpretation. Focusing on
actual application use cases by the online services, there is the concept of
message profiles. These are narrowed conformance profiles based on the messages
in the XJustiz standard. Message profiles are developed in cooperation with the
service teams. They are much more restrictive and enforce various invariants for
their related use case. But they also strip down plenty of irrelevant aspects
for the targeted use case.

The following table lists all the supported online services and their related
message profile.

| Online Service         | Message Profile |
| ---------------------- | --------------- |
| Digitale Zahlungsklage | `Zahlungsklage` |

### Use the Message Orchestrator

The message orchestrator is the primary artifact that enables the composition of
a message. The orchestrator ensures structural invariants and enforces identity
constraints.

Knowing the message profile, it starts with importing the related message
orchestrator function. The library has a separate entrypoint for each message
profile. Entrypoints are self-contained. Anything required in the following
steps can be imported directly from the same path. Such includes functions,
types, constants, etc.

```typescript
import { zahlungsklage } from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";
```

The message orchestrator opens the document scope to the composition function
that is passed as first parameter. The document scope is a type-level and
runtime boundary that secures certain constraints of a message and is unique per
orchestrator call. The orchestrator provides a token with the scope as
parameter.

```typescript
zahlungsklage(
  /* compose: */ (scope) => {
    // ...
  },
);
```

The scope token carries invariant type-level information and provides access to
certain runtime features. For example, the token can be used to obtain
identifier generators for the scope (more on this in [working with
identifiers](#working-with-identifiers)).

```typescript
zahlungsklage((scope) => {
  const rollennummer = createRollennummerGenerator(scope);
  // ...
});
```

Scoping is an important pattern in the XJustiz-Bridge. While the here
documented guides should be sufficient to learn how to use it, there is some
[additional documentation](#more-on-the-scoping-pattern) in case you want to
learn more about it.

Message orchestrators put multiple restrictions onto the composition function.
The output must be a valid instance of the matching message profile (here
`Zahlungsklage`). There are dedicated guides [how to fill the content of the message](#fill-the-content).

The instance of the message profile must then pass a final verification to
obtain a `VerifiedNachricht` using the `verifyNachricht` function, as expected
by the orchestrator. Any violations at this point cause a type mismatch and
result in compiler errors that must be fixed. For example, a duplicate
identifier.

```typescript
zahlungsklage((scope) => {
  // Composing message ...
  return verifyNachricht({
    /* ... */
  });
});
```

The final output of the orchestrator is the composed message encoded as XML
document in a plain string. The "generation" of the XML is done by the official
[XJustiz-Tools](https://xjustiz.justiz.de/XJustiz-Werkzeuge/index.php). The
XJustiz-Tools are an HTTP REST based service that provides diverse capabilities
to support the work with XJustiz. It is a 3rd party, yet proprietary, product
with restricted access, but with the ambitions to become Open Source eventually.
The XJustiz-Bridge requires the connection parameters to a running instance
of this service. It uses it to generate the actual XML document as final step.
For the _Onlinedienste der Justiz_, contact the Court Communication team to get
access to an internally managed service instance.

```typescript
const compositionResult = await zahlungsklage(
  (scope) => {
    // Composing message ...
  },
  { baseUrl: "https://<to-be-filled>" },
);

if (compositionResult.ok) {
  console.log(compositionResult.xjustizMessageXml);
} else {
  // No message ...
}
```

In theory, the XJustiz-Bridge enforces the composition of valid messages
only. As a result, the XJustiz-Tools should never fail, unless the
XJustiz-Bridge has a bug. However, the integration with the XJustiz-Tools as
a remote service inherently introduces the risk of runtime errors. These errors
can not be recovered from. Therefore, no details are shared cross the boundary.
The XJustiz-Bridge does its best to address network issues and a temporary
unavailable service. Additional retry and back-off logic on top is not
recommended. The internally managed service instance for the _Onlinedienste der
Justiz_ is monitored by the Court Communication team to detect bugs and issues
as early as possible.

What remains is the actual composition with the content of the message itself.

### Fill the Content

#### From Scalars to Full Messages

After all, a message is a structured XML document following a schema definition
plus Schematron rules. The data fields at the leaves of such a document are
called scalars. Scalars come in various different kinds and shapes — from
enumerations to type with smart constructor. Using message orchestrators,
scalars get composed into full messages.

Composing a full message means to follow the message profile. The composition
function passed to the orchestrator directly infers the correct message profile
by the expected return type. The structure can be discovered by manual
completion or inspecting the type directly. Message profiles can be extensive.
The full composition usually requires to be cut into multiple smaller chunks.

The composition can be quite verbose and highly depends on the data resources
for the content. In this context, the documentation refrains from providing
a full example. To get a good first impression, an exemplary composition that
touches all relevant concepts looks like the following.

```typescript
import {
  createRollennummerGenerator,
  datatypeA, // Actual DIN 91379 datatypes, no documentation placeholders.
  datatypeB,
  Rollenbezeichnung,
  verifyNachricht,
  zahlungsklage,
  // ... everything else used during composition
} from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

const compositionResult = zahlungsklage(
  (scope) => {
    // See documentation section for identifiers
    const rollennummer = createRollennummerGenerator(scope);
    const rollennummerFuerKlaeger = rollennummer.first(
      Rollenbezeichnung.Klaeger,
    );

    const klaeger = {
      rolle: [
        {
          rollennummer: rollennummerFuerKlaeger,
          // See documentation for Codelisten
          rollenbezeichnung: Rollenbezeichnung.Klaeger,
        },
      ],
      beteiligter: {
        auswahlBeteiligter: {
          natuerlichePerson: {
            vollerName: {
              // See documentation section for refined types
              nachname: datatypeA("Mustermann").value,
            },
            geschlecht: Geschlecht.Weiblich,
            anschrift: [
              {
                strasse: datatypeB("Musterstrasse").value,
                hausnummer: datatypeB("1A").value,
              },
            ],
          },
        },
      },
    };

    const rollennummerFuerGesetzlichenVertreter = rollennummer.next(
      rollennummerFuerKlaeger,
      Rollenbezeichnung.GesetzlicherVertreter,
    );

    const gesetzlicherVertreter = {
      rolle: [
        {
          rollennummer: rollennummerFuerGesetzlichenVertreter,
          rollenbezeichnung: Rollenbezeichnung.GesetzlicherVertreter,
          geschaeftszeichen: datatypeC("KM-0042-2026").value,
          referenz: [{ refRollennummer: reference(rollennummerFuerKlaeger) }],
        },
      ],
      beteiligter: {
        auswahlBeteiligter: {
          raKanzlei: {
            bezeichnung: {
              bezeichnungAktuell: datatypeD("Kanzlei Mustermann").value,
            },
            kanzleiform: Kanzleiform.Einzelanwalt,
          },
        },
      },
    };

    // ... and much more

    return verifyNachricht({
      nachrichtenkopf: {
        /* ... */
      },
      grunddaten: {
        verfahrensdaten: {
          beteiligung: [klaeger, gesetzlicherVertreter],
        },
      },
      inhaltsdaten: {
        /* ... */
      },
    });
  },
  { baseUrl: "https://<to-be-filled>" },
);
```

#### Refined Types and Input Validation

The XJustiz standard defines a set of datatypes with certain restrictions. For
example, scalars for positive integers or strings with limited character sets.
These scalars don't map to plain TypeScript types, but carry additional
invariants.

These scalars are represented as refined types with smart constructors. Parsing
input values, invariants are validated and persisted as read-only, branded
instances. Having an instance successfully constructed, it can be securely passed
anywhere a message profile requires this scalar type. This creates a clear
boundary of possible errors that must be handled at runtime, before a message
can be composed.

##### Construction

Refined types can be constructed in three different ways: parsing dynamic
input values at runtime, using static literal values at compile-time, and by
integration with the [Standard Schema](https://standardschema.dev). Each refined
type has a factory associated with it, acting as smart constructor providing all
these features.

The construction of refined types for dynamic input values is expected to take
place outside the message orchestrator. Within the orchestrator, there is no
possibility to act on failed parsing results. Construction from static literals
works just fine, as shown throughout the documentation.

###### Using the Standard Schema

The potentially most flexible approach is to bind the types via Standard Schema.
For dynamic user input, the error handling is done best in the user interface,
directly at the forms. This allows users to correct their inputs and have
properly branded instances as result. The Standard Schema is supported by [a
long list of libraries, frameworks, and
tools](https://standardschema.dev/schema#what-schema-libraries-implement-the-spec),
making it pretty straightforward to use.

A minimal example of using it with the [Zod](https://zod.dev) schema library
looks like the following code snippet. It validates all input values and
transforms them (Zod terminology) into branded instances. The refined type
factories themselves are compatible Standard Schemas.

```typescript
import * as z from "zod";
import {
  datatypeA, // Standard Schema for DatatypeA
  datatypeB, // Standard Schema for DatatypeB
} from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

const User = z.object({
  name: datatypeA,
  address: z.object({
    street: datatypeB,
    houseNumber: datatypeB,
  }),
});

const user = User.parse(someInput);
user.name; // <-- branded instance of DatatypeA
user.address.street; // <-- branded instance of DatatypeB

// Ready to be used with message orchestrators ...
```

Another example would be the [RVF](https://www.rvf-js.io) (Remix Validated Form)
library which supports the Standard Schemas out-of-the-box as well.

###### Using the Parsing Function Directly

For more fine-grained control, the factory can be used as a parse function
directly. Parsing can either result in a successfully created instance or
a failure with some parsing issues.

```typescript
import {
  datatypeA, // Refined type factory of DatatypeA
  datatypeB, // Refined type factory of DatatypeB
} from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

const result = datatypeA(someInput);

if (!result.issues)
  console.log(`Successfully constructed value: ${result.value}`);
else console.log(`Failed with issues: ${JSON.stringify(result.issues)}`);
```

For inputs that are statically known at compile-time, handling parse results is
unnecessarily verbose or practically impossible to get right. Like constant
template strings, fixed in code, that don't depend on dynamic user input.
Therefore, refined types support compile-time parsing. The level of support
varies per type and is documented on the associated factory. Given a static
literal as input, the compiler can predetermine the result. That dissolves the
handling of the result at runtime, because the compiler ensures direct value
access is safe. Note that at runtime, the parse logic will always run, attesting
the invariants.

**On Success:** The compiler allows direct, safe access on `.value`

```typescript
const name = datatypeA("Max").value; // Safe: Compiler allows direct usage
```

**On Failure:** The compiler prevents access on `.value` showing an error message

```typescript
datatypeA("Max1!").value; // Compiler error: Inaccessible with static issue message
```

**Unsupported Inputs:** The compiler can't parse the input

```typescript
const someResult = datatypeA("יצחק"); // Undetermined: Input not supported by compile-time parsing
const otherResult = datatypeA(someInput); // Undetermined: Non-static, dynamic input
```

In case the compiler predetermines a failure result, it will also report an
issue message — just as runtime results. They are directly visible to the
developer in the editor. Messages at compile-time mirror those reported at
runtime for the same issue. Though, they may be limited in metadata for
template-based issues, in comparison to their runtime counterpart.

##### Customizing Issue Messages

Each refined type can be fully customized in terms of which issue messages it
reports. Therefore, a type defines an enclosed list of possible issues that can
occur during parsing. Each issue is mapped to either a static string or a string
template. In the latter case, additional metadata is provided as argument to
a callback function. This mechanism can be used however it fits best. It is
possible to map issues to plain error codes that will be used for
a complementing lookup mechanism, possibly in combination with an
internationalization layer.

Customization is done by calling the `customize` method on a factory. It
requires a complete mapping for all possible issues of the refined type.
Autocompletion, compiler messages, and code actions help to do so. The result is
a new instance of the factory with customized issue messages. That means the
result can be used the same way as the original factory.

```typescript
import { datatypeA as originalDatatypeA } from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

const datatypeA = originalDatatypeA.customize({
  invalidCharacters: (characters) =>
    `Please delete the following characters: ${[...characters].join()}`,
});

// Use it just as before:
const User = z.object({ name: datatypeA });
const name = datatypeA("Max").value;
const result = datatypeA(someInput);
```

Notice that the customization does not apply to compile-time parsing. Parsing
issues reported by the compiler only face developers and can't be changed.

##### Excursion - Deep Integrated Usage with Zod

When using Zod as schema library (as the _Onlinedienste der Justiz_ do), it
might be necessary to integrate more deeply with the refined types. While Zod
supports the Standard Schema natively, as shown above, it might be necessary to
combine it with other schemas. Unfortunately, Zod does not allow Standard
Schemas to be used with operators like `and`, `or`, or `pipe`. For example,
`myZodSchema.pipe(datatypeA)` does not work. If this is required, it is
necessary to "convert" the Standard Schemas into first-class Zod schemas. The
following code snippet can be copied to do so. It takes into account the
transforming properties of the refined types. Make sure to **always** use the
`pipe` operator instead of a plain `and`, to maintain the transformed type.
Else, `myZodStringSchema.pipe(datatypeA)` becomes finally parsed as plain
`string`, not `DatatypeA`.

```typescript
import { datatypeA as originalDatatypeA } from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

export const datatypeA = convertStandardSchemaToZod(
  originalDatatypeA.customize({
    /* ... */
  }),
);

/**
 * While Zod supports Standard Schemas natively, it doesn't allow them to be used
 * with operators like `and`, `or`, or `pipe`. For example,
 * `someZodSchema.pipe(someStandardSchema)` is not allowed. This function takes
 * a Standard Schema and constructs a fully integrated Zod schema from it.
 * Doing so, it takes into account possible input to output transformations by
 * the validation function of the Standard Schema.
 */
function convertStandardSchemaToZod<Input, Output>(
  schema: StandardSchemaV1<Input, Output>,
): z.ZodType<Output, Input> {
  return z.any().transform((input, context) => {
    const result = schema["~standard"].validate(input);

    if (result instanceof Promise)
      throw new Error("Asynchronous schemas are not supported");

    if (result.issues) {
      result.issues?.forEach((issue) => context.addIssue(issue.message));
      return z.NEVER;
    } else {
      return result.value;
    }
  });
}
```

The [`StandardSchemaV1`](https://standardschema.dev/schema#the-interface) can be
added by the
[`@standard-schema/spec`](https://www.npmjs.com/package/@standard-schema/spec)
package directly (already a transitive dependency). As an alternative, the
standard also recommends to just copy the types selectively.

#### Working with Identifiers

The XJustiz standard defines various kinds of identifiers for different types of
elements in a message (e.g. `UUID` or `Rollennummer`). Elements can be referenced
across messages, but most commonly across the structures within the same message
document.

Identifiers occur in two different positions. They can either be declared as
identifier of an element they are attached to or they act as reference to such
an entity.

##### Generating Identifiers

Identifiers get produced by a related generator instance. Per scope, a single
generator instance can be obtained using the provided scope token. Trying to
create a generator for the same scope twice, results into the exact same instance.

```typescript
zahlungsklage(
  (scope) => {
    const uuid = createUuidGenerator(scope);
    // ...
    const exactSameGenerator = createUuidGenerator(scope);
  },
  {
    /* ... */
  },
);
```

Identifier generators produce a sorted sequence of unique instances for the
respective identifier type. This is partially because of XJustiz requirements,
but primarily to have identifiers that are unique at runtime (and eventually in
the final document) as well as on the type-level. The latter is important to
enable the compiler to verify identity constraints.

To produce a sequence, a generator has a static `first` identifier. From there,
it gets advanced using the `next` method, always passing the last identifier in
the sequence to generate the next one. Trying to advance the generator with the
same identifier again results into the exact same next instance, resulting into
an identity constraint violation for a duplicate identifier. This solution is
a trade-off between full type security and developer experience. Naming an
identifier is always possible, because they have a specific element they are
declared in. An advantage of the requirement to generate identifiers first is
the possibility for forward referencing.

```typescript
zahlungsklage(
  (scope) => {
    const uuid = createUuidGenerator(scope);
    const eigeneNachrichtenID = uuid.first();

    const nachrichtenkopf = {
      absender: { eigeneNachrichtenID },
      // ...
    };

    const vortragsID = uuid.next(eigeneNachrichtenID);
    // ...
  },
  {
    /* ... */
  },
);
```

##### Identifiers with Additional Discriminator

Some identifiers have custom behavior and need to carry more information to
fully depict all constraints. For example, the relationships between
participants and their roles. Therefore, these identifiers are generic to
a matching discriminator type. The message profiles enforce certain
discriminators for declarations and references. The discriminator of an
identifier is passed as extra argument during the generation.

In the following example, the `Rollennummer` identifier has an associated
`Rollenbezeichnung` as discriminator.

```typescript
zahlungsklage(
  (scope) => {
    const rollennummer = createRollennummerGenerator(scope);
    const rollennummerFuerKlaeger = rollennummer.first(
      Rollenbezeichnung.Klaeger,
    );

    const klaeger = {
      rolle: [
        {
          rollennummer: rollennummerFuerKlaeger,
          rollenbezeichnung: Rollenbezeichnung.Klaeger,
        },
      ],
      // ...
    };

    const rollennummerFuerBeklagter = rollennummer.next(
      rollennummerFuerKlaeger,
      Rollenbezeichnung.Beklagter,
    );

    // ...
  },
  {
    /* ... */
  },
);
```

##### Referencing

Using an identifier as a reference is possible or required wherever the message
profile defines `Reference<SomeIdentifierType>` as scalar type. Having the
generated identifier, it can be wrapped by `reference(identifierInstance)`.
Referencing by an identifier that is never used in the declaration position
within the final message results into an identity constraint violation for
a dangling reference. Therefore, make sure any referenced identifier is actually
used for declaration too.

```typescript
zahlungsklage(
  (scope) => {
    const rollennummer = createRollennummerGenerator(scope);
    const rollennummerFuerKlaeger = rollennummer.first(
      Rollenbezeichnung.Klaeger,
    );

    const klaeger = {
      rolle: [
        {
          rollennummer: rollennummerFuerKlaeger,
          rollenbezeichnung: Rollenbezeichnung.Klaeger,
        },
      ],
      // ...
    };

    const gesetzlicherVertreter = {
      rolle: [
        {
          referenz: [{ refRollennummer: reference(rollennummerFuerKlaeger) }],
        },
      ],
      // ...
    };

    // ...
  },
  {
    /* ... */
  },
);
```

#### Using Codelisten

The XJustiz standard has the concept of so called Codelisten. Codelisten are
actually a generic concept from the higher level [XÖV standardization
framework](https://docs.xoev.de/x%C3%B6v-codelisten/%C3%BCbersicht). A Codeliste
is basically a list of possible code values with description. Pretty much like
an enumeration. While their concept matches enumerations quite closely, they are
not represented as such in TypeScript, due to technical limitations of the
programming language. Though, their look and feel is similar.

Codelisten are scalar values. During composition, their descriptive name is used
primarily. The final message only includes the related code. For example,
`Rollenbezeichnung` is a Codeliste. The Codelisteneintrag by the name `Klaeger`
maps to `{ "code": "101" }`. `Rollenbezeichnung` is the type as well as the related
constant object map of the Codeliste.

```typescript
zahlungsklage(
  (scope) => {
    const klaeger = {
      rolle: [
        {
          rollenbezeichnung: Rollenbezeichnung.Klaeger,
        },
      ],
      // ...
    };
    // ...
  },
  {
    /* ... */
  },
);
```

#### Accessing the Scope Type Directly

Full messages can be extensive and composing them is quite some work. Cutting
the composition into smaller chunks is often helpful. Typing these chunks along
the composite types of the message profile is handy, because it allows for
autocompletion and local feedback by the compiler. Because the majority of
composites depend on the scope, it becomes necessary to access the scope type
directly — carried by the scope token.

```typescript
zahlungsklage(
  <NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
    const klaeger = {
      // Full language support here.
    } satisfies Klaeger<NachrichtenScope>;
  },
  {
    /* ... */
  },
);
```

It is important to use `satisfies` operator. Otherwise, the final
`verifyNachricht` will not work and report issues, because it can't properly
evaluate the exact type of the composed message object.

## More on the Scoping Pattern

For most cases, there is no need to understand the scoping pattern in more
detail. Composing a message successfully should be possible just from knowing
the basics as shown in the guides here. The following is completely optional.

Scoping is a mechanism in the XJustiz-Bridge that is used to create
a boundary in which certain constraints are enforced. For example, the
identifier type `Rollennummer` must not only be unique within an
XJustiz-Bridge, but it should also be an incrementing counter.

Scoping is integrated with by certain scalar types, like identifiers. Up the
schemata, composites that build on top of these scalars inherently become scoped
too. Thereby, basically any message profile becomes scoped. In result, any
scoped instance value within the same message must align. Mixing instances of
different scopes is impossible and flagged by the TypeScript compiler. This
creates unity and the bespoken constraint boundary.

In theory, a scope can be anything. It is just an unrestricted generic type
parameter. But within a message orchestrator it is highly protected. It uses
a rank-2 generic function to obtain a scope for a single execution block. The
scope is guaranteed to be unique and can't be named. It is literally impossible
to tamper, because it exists ephemeral in the compiler only. Also, scopes are
guarded to be invariant. Instances of types generic to a scope are only
compatible if the scope is absolutely exactly the same. This property is so
strong, that it is not possible to return anything from a scoped block that
carries the scope type. For a message orchestrator that means only the XML
encoded document can ever be returned — never the message profile instance.

Furthermore, scopes also have a runtime dimension to them. Using a token as
carrier of the scope type, it is also a fully unique `Symbol` during runtime. It
acts as key that provides access the singleton registry of the scope. For
example, identifier generators are common singletons. To obtain an instance, it
requires the scope token. Trying to obtain a singleton multiple times for the
same scope just resolves to the exact same instance.

Any further details or reasoning can be found in the internal [pattern
documentation](../documentation/patterns/scoping.md) for development. Finally,
the implementation itself is quite well documented in code too.
