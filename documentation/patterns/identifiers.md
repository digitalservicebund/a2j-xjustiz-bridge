# Identifiers

## Problem

In the schemata for the XJustiz standard, there are multiple entities which are
assigned to and referenced by specific identifiers. The schemata define
different datatypes for different identities, but not each entity has
a dedicated identifier type. This is partially encoded in comments and
human-readable documentation only. Partially it is even just undetermined.

Furthermore, the scope in which an identifier is unique is constrained. Some
must be globally unique, using standards like UUID (universally unique
identifiers). Others are only unique within a single XJustiz-Nachricht.

In addition, it is important to ensure that references can't be identifiers that
are assigned to entities in a different XJustiz-Nachricht, unless explicitly
defined so and only for global unique identifiers.

Finally, it must not be possible to reference to entities that have a valid
identifier in the scope, but do not end up in the final XJustiz-Nachricht. Like
dangling references.

## Solution

Identifiers are defined as new-type with scoping and additional markers for
identity constraints. Instances can only be produced by a generator function.
Generator instances are related to a given scope, producing unique identifiers
on runtime and type level.

### What Entities Get Their Own Identifier?

To securely construct valid XJustiz-Nachrichten, it requires to have distinct
identifier types per kind of entity. In result, entities that share the same
identifier type in the standard, get separate types based on that one in the
XJustiz-Converter. This helps to avoid any unintended confusions and possible
incorrect references. However, there are certain exceptions. Like the
`FortlaufendeNummer`, that has a continuously incrementing counter as generator,
shared by multiple entities. Such exceptions must use the technique of
[additional type discriminators](#additional-type-discriminators).

### New-Type for Values

Identifiers have two dimensions: the actual runtime value and the type-level.
The former is what actually ends up as part of a document. The latter is purely
for type-level computation and constraints.

The type for the runtime value uses the [type branding
pattern](./type-branding.md) as foundation. It makes identifiers unmistakable and
gives the module of the identifier type control over instantiation.

`some-identifier.ts`:

```typescript
type SomeIdentifierValue = number & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createSomeIdentifierGenerator` factory.";
};

declare const TAG: unique symbol;
```

### Identity Constraints

Identifier used in a document must adhere to the identity constraints. Such
include the uniqueness of identifier declarations and the referential integrity.
These constraints are evaluated statically at compile-time. Therefore, they
require certain capabilities of each identifier type to allow for these
type-level computations.

The sum of all type-level capabilities and marker types is collected into the
`WithIdentifierCapabilities` type, each identifier type must intersect with. The
details of the generic type parameters get explained in the following sections.
The `WithIdentifierCapabilities` type is defined as an interface to hide the
details from library users and keep the public interface better readable and
comprehensible.

`some-identifier.ts`:

```typescript
/*
 * Identifier for some entities of important kind. Instances are only unique
 * within the XJustiz-Nachricht they are included in.
 *
 * Some identifiers can be produced with an instance of the related generator,
 * obtained by the {@link createSomeIdentifierGenerator} factory.
 */
export type SomeIdentifier<
  NachrichtenScope,
  Ordinal extends number = number,
> = SomeIdentifierValue &
  WithIdentifierCapabilities<SomeIdentifierValue, NachrichtenScope, Ordinal>;
```

#### Scoping

The identity constraints directly integrate with the [scoping
pattern](./scoping.md). Scoping ensures consistency and avoids (accidentally)
confusing identifiers between different XJustiz-Nachrichten.
Generated identifier instances are strictly related to their scope can
exclusively be used within this scope. The most common scope is the
`NachrichtenScope` that spans the full document of an XJustiz-Nachricht that
gets composed. Commonly, also globally unique identifiers are included here,
unless references to external entities are required.

Scopes are used primarily as strong type-level restriction. But they also carry
runtime capabilities. Each unique scope has a singleton registry, which is for
example used for [generator instances](#generation-with-distinctive-markers)
tightly coupled to their scope.

#### Occurrences

Identifiers occur in two different positions. They can either be declared as
identifier of an entity they are attached to or they as reference to identity
such an entity. Therefore, any property of a composite must either define if it
expects a declaration or reference of an identifier. For convenience, generated
identifiers are automatically marked as declaration for direct usage. References
on the other side need to be explicit and can be created from declarations.

```typescript
type SomeComposite<NachrichtenScope> = {
  identifier: SomeIdentifier<NachrichtenScope>;
  relatedTo: Reference<SomeIdentifier<NachrichtenScope>>>;
};

const someIdentifier = someIdentifierGenerator.first();

const composite: SomeComposite = {
  identifier: someIdentifier,
  relatedTo: reference(someIdentifier),
};
```

#### Generation with Distinctive Markers

Runtime values of an identifier are expected to be unique. However, to the
compiler they are of the same type and not distinctive. Therefore, identifiers
must use a distinctive marker. Under the hood, a distinctive marker is a tuple
of the identifier value and an ordinal number. The types of two identifier
instances become unique by their ordinal.

To achieve this, identifiers must be generated as strict sequence. An instance
of an identifier generator has a `first` identifier that has the ordinal `0`.
Advancing the generator with `next()` requires to pass the previously generated
identifier in the sequence, incrementing the ordinal on a type level. To ensure
the strict relationship between runtime values and literal types, a the same
generator instance must always produce the same value and type for the same
position in the sequence. A truly new instance can only be generated by
advancing the sequence based on last generated identifier. The resulting
sequence is fully distinguishable by the TypeScript compiler.

```typescript
const firstIdentifier = someIdentifierGenerator.first(); // Ordinal 0
const secondIdentifier = someIdentifierGenerator.next(firstIdentifier); // Ordinal 1
const thirdIdentifier = someIdentifierGenerator.next(secondIdentifier); // Ordinal 2

const equalToSecondIdentifier = someIdentifierGenerator.next(
  someIdentifierGenerator.first(),
); // Ordinal 2
```

An identifier type with the `Ordinal` type parameter as plain `number` basically
means "any identifier of this type for this scope". It is the default for each
identifier type to allow for direct usage in composite definitions.

For the implementation of identifier generators, there are the two dimension
again. The base generator produces non distinctive, but branded identifier
**values**. For differentiation, they are also sometimes called a producer. In
the context of the branded new-type value, a producer is a smart constructor and
the only way to obtain instances.

```typescript
const SomeIdentifierProducer: NonDistinctiveGenerator<SomeIdentifierValue> = {
  first: () => 1 as SomeIdentifierValue,
  next: (previous) => (previous + 1) as SomeIdentifierValue,
};
```

This must be enhanced on a type level to add the distinctive marker with the
incrementing ordinal. Generators are defined as interface to hide details from
library users to keep the public interface better readable and comprehensible.
Due to higher-kinded type limitations, especially in combination with
identifiers using [additional type
discriminators](#additional-type-discriminators), there is no meaningful
code that could be shared here. It must be copy-pasted per identifier type.

```typescript
interface SomeIdentifierGenerator<NachrichtenScope> = {
  first: () => SomeIdentifier<NachrichtenScope, 0>;
  next: <Ordinal extends number>(
    previous: SomeIdentifier<NachrichtenScope, Ordinal>
  ) => SomeIdentifier<NachrichtenScope, Increment<Ordinal>>;
}
```

The generator factory of an identifier type brings then everything together.
I uses the [singleton registry of a scope](./scoping.md#scoped-singletons) to
obtain a single generator instance per given scope. That means, calling the
factory twice for he same scope returns the exact same generator instance.

````typescript
/**
 * Factory to obtain an identifier generator to produce {@link SomeIdentifier}s.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const someIdentifier = createSomeIdentifierGenerator(scope);
 *   const someComposite = {
 *     identifier: someIdentifier.first(),
 *     // ...
 *   }
 * })
 */
export function createSomeIdentifierGenerator<NachrichtenScope(
  scope: ScopeToken<NachrichtenScope>
): SomeIdentifierGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(
    scope,
    SOME_IDENTIFIER_GENERATOR_KEY,
    () => SomeIdentifierProducer
  ) as never;
}

const SOME_IDENTIFIER_GENERATOR_KEY = Symbol("some-identifier-generator");
````

A generator can then be obtained and used within their scope like this:

```typescript
withScope((scope) => {
  const someIdentifierGenerator = createSomeIdentifierGenerator(scope);
  const firstIdentifier = someIdentifierGenerator.first();
  const secondIdentifier = someIdentifierGenerator.next(firstIdentifier);

  const sameGenerator = createSomeIdentifierGenerator(scope);
  const thirdIdentifier = sameGenerator.next(secondIdentifier);
});
```

##### Memorizing Nondeterministic Generators

Some identifier types don't have a natural sequence like the primitive counter.
In that sense they are nondeterministic based on a previous value in the
sequence. The most prominent example are fully random identifiers like for UUID
version 4. Such "value producing functions" can be wrapped as a memorized
sequence generator using the `memorizeAsGenerator` function.

```typescript
export function createSomeIdentifierGenerator<NachrichtenScope(
  scope: ScopeToken<NachrichtenScope>
): SomeIdentifierGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(
    scope,
    SOME_IDENTIFIER_GENERATOR_KEY,
    () => memorizeAsGenerator(randomSomeIdentifier),
  ) as never;
}

function randomSomeIdentifier(): SomeIdentifierValue {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return /* something nondeterministic */ as SomeIdentifierValue;
}
```

#### Verifying Constraints

Given the identifier capabilities like declarations, references, and distinctive
markers, constraints can be verified via type-level computations. For every
referenced identifier it is possible to search for a matching declaration. Also,
all identifiers in the declaration position of a document must be unique.
Violations to these constraints are reported as compiler errors using the
`VerifyIdentityConstraints` type.

### Additional Type Discriminators

Some identifiers have custom behavior and need to carry more information to
fully control identity constrains. Such can be the need to allow for further
restrictions of references. For example, references to Beteiligungen by
a `Rollennummer` might need to be restricted based on the associated
`Rollenbezeichnung`, to control certain relationships between Beteiligungen. Or
similar, the `FortlaufendeNummer` can't be separated into multiple identifier
types, as it requires an overall incrementing counter cross all entities.
However, references via `FortlaufendeNummer` require certain restrictions based
on the related entity.

The basic mechanism is to use an additional type discriminator withe a generic
parameter. Composite type definitions can specify possible discriminator
literals for identifier declarations and references. When generating an
identifier, the discriminator must be specified as argument.

In contrast to their name, discriminators do not affect the distinctive value on
a type level. Two instances of the same identifier type and ordinal number are
unique, no matter their discriminator.

````typescript
/**
 * Identifier for entities of important kind. Instances are only unique within
 * the XJustiz-Nachricht they are included in.
 *
 * Some identifiers can be produced with an instance of the related generator,
 * obtained by the {@link createSomeIdentifierGenerator} factory.

 * Helpful documentation about the restriction by the generic parameter for the
 * discriminator...
 */
export type SomeIdentifier<
  NachrichtenScope,
  Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal,
  Ordinal extends number = number
> = SomeIdentifierValue & {
  readonly [UNTERSCHEIDUNGSMERKMAL]: Unterscheidungsmerkmal,
} & WithIdentifierCapabilities<SomeIdentifierValue, NachrichtenScope, Ordinal>

declare const UNTERSCHEIDUNGSMERKMAL: unique symbol;
export type ArtVonUnterscheidungsmerkmal = "A" | "B" | "C";

type SomeIdentifierValue = /* ... */;

/**
 * Factory to obtain an identifier generator to produce {@link SomeIdentifier}s.
 * Generating {@link SomeIdentifier} requires to provide the
 * {@link ArtVonUnterscheidungsmerkmal}.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const someIdentifier = createSomeIdentifierGenerator(scope);
 *   const someComposite = {
 *     identifier: someIdentifier.first("A"),
 *     // ...
 *   }
 * })
 */
export function createSomeIdentifierGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>
): SomeIdentifierGenerator<NachrichtenScope> {
  // ...
}

const SomeIdentifierFactory: NonDistinctiveGenerator<SomeIdentifierValue> = {
  / ...
};

interface SomeIdentifierGenerator<NachrichtenScope> = {
  first: <Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal>(
    unterscheidungsmerkmal: Unterscheidungsmerkmal,
  ) => SomeIdentifier<NachrichtenScope, Unterscheidungsmerkmal, 0>;

  next: <
    Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal,
    Ordinal extends number
  >(
    previous: SomeIdentifier<NachrichtenScope, ArtVonUnterscheidungsmerkmal, Ordinal>,
    unterscheidungsmerkmal: Unterscheidungsmerkmal,
  ) => SomeIdentifier<NachrichtenScope, Unterscheidungsmerkmal, Increment<Ordinal>>;
}
````
