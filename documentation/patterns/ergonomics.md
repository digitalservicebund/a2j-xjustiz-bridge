# Ergonomics

## Problem

XJustiz schemas closely follow the standard. Building their nested structures by
hand can lead to repetitive code and requires knowledge of details that are
fixed by the use case.

## Solution

Ergonomic constructors provide a shorter way to create common parts of an
XJustiz message. They take the values supplied by an online service and add the
schema details that are fixed for the use case.

Constructors live in the [ergonomics modules](../../package/src/ergonomics/) and
are exported through the entrypoint of the corresponding message profile. Their
parameters and return types use the existing schema and message profile types.
They do not introduce a separate domain model.

### Constructors

Constructors remove repeated nested structures and set values that are fixed by
the use case. For example, `geldbetrag` creates a `Geldbetrag` using Euro as its
currency:

```typescript
import { geldbetrag } from "@digitalservicebund/a2j-xjustiz-bridge/nachricht/zahlungsklage";

const betrag = geldbetrag(5_000);
```

The result has the schema structure expected by XJustiz:

```json
{
  "zahl": 5000,
  "auswahlWaehrung": {
    "waehrung": {
      "code": "EUR"
    }
  }
}
```

`geldbetrag` only supports Euro because that is the currency used by the German
`Zahlungsklage` profile.

### Type Preservation

Constructors must preserve narrow identifier and scope types. This allows
TypeScript to enforce valid references between parts of a message.

For example, `antragAufAnwaltskosten` keeps the claim and role identifiers,
including their scope and ordinal values, that it receives. TypeScript can
therefore flag invalid combinations while the message is being composed, instead
of leaving the error to schema validation.

### Profile Entrypoints

Each profile exposes its ergonomics helpers through its own entrypoint, such as
the
[`Zahlungsklage` entrypoint](../../package/src/nachricht/zahlungsklage/index.ts).
Users can therefore import the helpers from the profile they are working with
without knowing how the underlying schema modules are organised.
