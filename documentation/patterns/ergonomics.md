# Ergonomics

## Problem

XJustiz schemas closely follow the standard. Building the nested structures of
the composites by hand can lead to repetitive code and requires knowledge of
details that are fixed by the use case.

## Solution

Ergonomic constructor functions provide a shorter way to create common parts of
an XJustiz message. They take the values supplied by an online service and add
the schema details that are fixed for the use case. Their parameters and return
types use the existing schema and message profile types. They do not introduce
a separate domain model.

### Location & Access

Constructors live in the ergonomics modules next to where the composites are
defined. For example, there are ergonomic functions for the composites of the
Grunddatensatz or for the Fachmodul for Klageverfahren (KLAVER). Also message
profiles themselves can have ergonomic functions defined. Finally, each
entrypoint for a message profile collects the levels of ergonomics that are
relevant. For example, for Zahlungsklage the ergonomics of Zahlungsklage itself,
KLAVER, and Grunddatensatz are relevant.

The entrypoint for message profile must export all collected ergonomic functions
in a namespace:

```typescript
export * as ergonomics from "./ergonomics";
```

### Implementation

Constructors are plain, pure functions. They create a named interface with
a signature that is slimmer and faster to use than constructing the full
composite by hand. Ergonomic function should focus on sensible defaults,
exposing parameters to overwrite them where meaningful.

Ergonomics are an important part of the public surface for users. They should be
documented with full examples. Some might need more context to create a full
picture.

A short example for `Geldbetrag`:

```typescript
/**
 * Constructs a {@link Geldbetrag} from an amount in Euro.
 *
 * @example
 * const betrag = geldbetrag(5_000);
 */

export function geldbetrag(zahl: Double): Geldbetrag {
  return {
    zahl,
    auswahlWaehrung: {
      waehrung: Waehrung.Euro,
    },
  };
}
```

### Type Preservation

Composing a message requires to work with literal types to allow for type-level
validations. Ergonomic functions must output literal types based on their inputs
where necessary. This is done using constant generic type parameters, an
inferred return based on a satisfied statement. For parameter types that are
generic over a scope, a scope token parameter must be used. Without such
a parameter, the compiler can't resolve the generic scope.

Because the way [identifiers](./identifiers.md) work, ergonomic functions can't
generate them automatically. Therefore, any identifier is expected to be passed
as argument.

An example that preserves the literal types of identifiers:

```typescript
export function zeuge<
  NachrichtenScope,
  const Nummer extends BeweisNummer<NachrichtenScope>,
  const RollennummerDesZeugen extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Zeuge
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  beweisNummer: Nummer,
  rollennummerDesZeugen: RollennummerDesZeugen,
) {
  return {
    beweisNummer,
    auswahlBeweismittel: {
      zeugen: { refRollennummer: reference(rollennummerDesZeugen) },
    },
  } satisfies Beweis<NachrichtenScope>;
}
```

### Discoverability

Despite having the `ergonomics` namespace to discover constructor functions,
composites that can be constructed by an ergonomic function should include
references in their documentation.

```typescript
/**
 * Can be constructed ergonomically with the {@link zeuge} or
 * {@link parteivernehmung} constructor functions.
 */
export interface Beweis {
  /* ... */
}
```
