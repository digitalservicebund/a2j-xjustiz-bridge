# XJustiz-Converter

> Assisted composition of XJustiz messages that are ensured to be valid.

The XJustiz-Converter is a component for the [Elektronischen
Rechtsverkehr](https://www.bundesjustizamt.de/DE/DasBfJ/Kontakt/Rechtsverkehr/Rechtsverkehr_node.html)
(electronic legal traffic), providing capabilities to compose legal messages
according to the [XJustiz](https://xjustiz.justiz.de) standard.

Valid messages in XML format can be composed using the
`@digitalservicebund/a2j-xjustiz-converter` TypeScript library. With a strong
type system and type-level computations, it guides the library user to adhere to
the standard and compose messages that are valid based on compile-time
guarantees. This provides early feedback to developers working on services,
without affecting the end-user experience in production negatively.

To learn more about the motivation, the scope, and approach of the
XJustiz-Converter, read the [documentation overview](../README.md).

> [!IMPORTANT]
> The XJustiz-Converter is heavily focused and developed primarily for the usage
> by the [Onlinedienste der Justiz](https://service.justiz.de) (online services
> for justice). It is part of the shared project [Zugang zum
> Recht](https://www.zugang-zum-recht-projekte.de/).

## Installation

```sh
npm add @digitalservicebund/a2j-xjustiz-converter
# or pnpm, yarn, ...
```

The library comes with rich IntelliSense support. Contextual hover hints,
autocompletion, and the compiler itself provide guidance directly in the editor.

<details>
  <summary>To further improve the experience, glossaries that explain the ubiquitous language can be set up to become automatically accessible from within a code editor.</summary>

Glossaries are written in a format consumable by
[Contextive](https://contextive.tech). Installing the extension for an editor,
it will automatically provide extra documentation context in hover hints,
everywhere code symbols contain terms found in the glossary. Complementing the
code documentation itself, this can help to work with the XJustiz domain and
the converter.

This requires to define a glossary file in the own (local) repository.

`xjustiz-converter.glossary.yaml`:

```yaml
imports:
  - https://github.com/digitalservicebund/a2j-xjustiz-converter/tree/main/xjustiz-converter.glossary.yaml
  # or with fixed release tag matching the installed library version (e.g. version 0.2.0):
  - https://github.com/digitalservicebund/a2j-xjustiz-converter/tree/v0.2.0/xjustiz-converter.glossary.yaml
```

</details>

## Requirements

The library is in theory agnostic to the JavaScript runtime environment.
However, there is a strong focus on NodeJS as primary environment, used for
development, testing, and production. The following APIs are expected to be
available on the global context object (`globalThis`):

- `Intl.Segmenter` (for Unicode segmentation)
- `crypto.randomUUID` (for unique identifier generation, UUID v4 expected)
- `Temporal` (for calendar based scalars)

## A Word on Type Security

The library is built around a strong type system, following the approach of
type-driven development to provide compile-time guarantees for valid
XJustiz-Nachrichten. In that regard, it is important that library users **do not
work against the compiler**. Within the context of using the library, users
should strictly refrain from using the `any` type, using unsafe type assertions
(e.g. `as unknown as SomeStrictType`), or ignoring errors with annotations (e.g.
`@ts-expect-error`). Doing so means fighting against the library and risk
producing runtime errors by incorrectly composed messages.

It is recommended to use strict linting rules to assist staying disciplined and
catch violations early. At least for the part of the codebase that interacts
with the XJustiz-Converter. Such could be for example Oxlint rules (e.g.
[`no-explicit-any`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-explicit-any.html),
[`no-unsafe-type-assertions`](https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-type-assertion.html))
or their respective counterpart by ESLint.

## Usage

The XJustiz standard is developed around the concept of messages as primary
entity — so does the library. For each supported message there is a separate
entry point to the library that can be accessed.

Each module of a message is self-contained, providing everything necessary to
compose such a message. The primary export is always the message orchestrator
function that starts a new message.

```typescript
import {
  zahlungsklage,
  type DatatypeA,
  type DatatypeB,
  // ... everything you need for Zahlungsklagen (payment claim)
} from "@digitalservicebund/a2j-xjustiz-converter/nachricht/zahlungsklage";

const message = zahlungsklage(/* compose message here */);
```

The XJustiz-Converter defines more message types than the XJustiz standard
itself. Messages in the standard often have a broad scope and can be quite
generic and open to interpretation. Focusing on actual application use cases by
the online services, there is the concept of message profiles. These are
narrowed conformance profiles based on the messages in the standard. Message
profiles are developed in cooperation with the service teams. They are much more
restrictive and enforce various invariants for their related use case. But they
also strip down plenty of not relevant aspects for the targeted use case.

> [!IMPORTANT]
> The concept of message orchestrators is currently not yet
> practically implemented. Existing implementations, shown in the examples, are
> only mocks and are intended to be used for early communication purposes.
> Message orchestrators will soon be implemented and available for production.
> Refined types for input validation are fully implemented and production ready.
>
> If you are starting with input validation, you can skip ahead to [Refined
> Types and Input Validation](#refined-types-and-input-validation).

### From Scalars to Full Messages

After all, a message is a structured XML document following a schema
specification. The data fields at the leaves of such a document are called
scalars. Scalars come in various different kinds and shapes, from enumerations
to smart refined types. Using message orchestrators, scalars get composed into
full messages. The orchestrators ensure structural invariants, control unique
identifier constraints, and allow for secure references within the document.

### Refined Types and Input Validation

The XJustiz standard defines a set of datatypes with certain restrictions. For
example, scalars for positive integers or strings with limited character sets.
These scalars don't map to plain TypeScript types, but carry additional
invariants.

These scalars are represented as refined types with smart constructors. Parsing
input values, invariants are validated and persisted as read-only, branded
instances. Having an instance successfully constructed, it can be securely passed
anywhere a message orchestrator requires this scalar type. This creates a clear
boundary of possible errors that must be handled at runtime, before a message
can be composed.

#### Construction

Refined types can be constructed in three different ways: parsing dynamic
input values at runtime, using static literal values at compile-time, and by
integration with the [Standard Schema](https://standardschema.dev). Each refined
type has a factory associated with it, acting as smart constructor providing all
these features.

##### Using the Standard Schema

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
factories themselves are proper standard schemas.

```typescript
import * as z from "zod";
import {
  datatypeA, // refined type factory of DatatypeA
  datatypeB, // refined type factory of DatatypeB
} from "@digitalservicebund/a2j-xjustiz-converter/nachricht/zahlungsklage";

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
library which supports the Standard Schemas out-of-the-box.

##### Using the Parsing Function Directly

For more fine-grained control, the factory can be used as a parse function
directly. Parsing can either result in a successfully created instance or
a failure with some parsing issues.

```typescript
import {
  datatypeA, // refined type factory of DatatypeA
  datatypeB, // refined type factory of DatatypeB
} from "@digitalservicebund/a2j-xjustiz-converter/nachricht/zahlungsklage";

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
const otherResult = datatypeA(someInput); // undetermined: Non-static, dynamic input
```

In case the compiler predetermines a failure result, it will also report an
issue message — just as runtime results. They are directly visible to the
developer in the editor. Messages at compile-time mirror those reported at
runtime for the same issue. Though, they may be limited in metadata for
template-based issues, in comparison to their runtime counterpart.

#### Customizing Issue Messages

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
const customDatatypeA = datatypeA.customize({
  invalidCharacters: (characters) =>
    `Please delete the following characters: ${[...characters].join()}`,
});

// Use it just as before:
const User = z.object({ name: customDatatypeA });
const name = customDatatypeA("Max").value;
const result = customDatatypeA(someInput);
```

Notice that the customization does not apply to compile-time parsing. Parsing
issues reported by the compiler only face developers and can't be changed.
