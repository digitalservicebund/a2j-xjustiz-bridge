# Identifiers

## Problem

In the schemata for the XJustiz standard, there are multiple entities which are
assigned to and referenced by specific identifiers. The schemata define
different datatypes for different identities, but not each entity has
a dedicated identity type. This is partially encoded in comments and
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

Identifiers are defined as new-type with some additional scoping. Instances can
only be produced by a generator function. Generator instances are related to
a given scope, producing unique identifiers. Generators must maintain restricted
access and are not exposed to library users directly.

### What Entities Get Their Own Identity?

To securely construct valid XJustiz-Nachrichten, it requires to have distinct
identity types per kind of entity. In result, entities that share the same
identifier type in the standard, get separate types based on that type in the
XJustiz-Converter. This helps to avoid any unintended confusions and possible
incorrect references. However, there are certain exceptions. Like the
`FortlaufendeNummer`, that has a continuously incrementing counter as generator,
shared by multiple entities. Such exceptions must use the technique to [further
enrich the identifier type](#enriching-identifier-types).

### Scoped New-Type

Applying the [type branding](./type-branding.md) and [scoping](./scoping.md)
patterns provides the foundation for each kind of identifier. The branding
prevents any mixing between different kinds of identifiers. Scoping ensures
consistency and avoids references between XJustiz-Nachrichten. While an
XJustiz-Nachrichten is the most common scope, there can be also others.
Also globally unique identifiers should be scoped, to allow for control on the
reference side. Thereby, it is possible to require references to entities inside
the same XJustiz-Nachricht, also if it is a global unique identifier. However,
this also allows references to explicitly point to identifiers of an external
scope.

Following the branding pattern, each identifier type gets its own module. The
type of an identifier will be exposed to library users and should be documented
respectively. In combination, an exemplary identifier type could look like this:

```typescript
declare const TAG: unique symbol;

/**
 * Identifier for entities of important kind. Instances are only unique within
 * the XJustiz-Nachricht they are included in.
 *
 * Some identifiers can be produced with an instance of the related generator,
 * obtained by the {@link createSomeIdentifierGenerator} factory.
 */
export type SomeIdentifier<NachrichtenScope> = number & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createSomeIdentifierGenerator` factory.";
} & WithScope<NachrichtenScope>;
```

### Generators

Each module of an identifier also exposes a factory function that can construct
new generator instances. Generators fall under the class of smart constructors
in the context of branded new-types. They are the only unit that is allowed to
assert the compiler valid instances of the identifier type. An instance must
produce unique identifiers for the scope they are related to. Generator
instances must be scoped singletons. Calling the factory multiple times for the
same scope token result into the exact same generator instance. A singleton is
registered to a scope internal registry using a unique key.

```typescript
export type SomeIdentifierGenerator<NachrichtenScope> =
  () => SomeIdentifier<NachrichtenScope>;

/**
 * Factory to obtain an identifier generator to produce {@link SomeIdentifier} values.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * withScope((scope) => {
 *   const nextSomeIdentifier = createSomeIdentifierGenerator(scope);
 *   const someComposite = {
 *     someIdentifierProperty: nextSomeIdentifier(),
 *     // ...
 *   }
 * })
 */
export function createSomeIdentifierGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): SomeIdentifierGenerator<NachrichtenScope> {
  return scopedSingleton(scope, SOME_IDENTIFIER_GENERATOR_KEY, () => {
    let nextIdentifier = 1;
    // oxlint-disable-next-line no-unsafe-type-assertion -- explicit cast for branding
    return () => nextIdentifier++ as SomeIdentifier<NachrichtenScope>;
  });
}

const SOME_IDENTIFIER_GENERATOR_KEY = Symbol("some-identifier-generator");
```

> [!INFO]
> The term generator in this context refers only to the generic concept.
> Not to generator objects from the iterator protocol in JavaScript. Functions
> that are declared with an asterisk (`function* myGenerator`) and `yield`
> values while being iterated. While theoretically usable, they provide no
> benefit here.

The naming convention for the function that creates a new generator
`create<IdentifierTypeName>Generator`. An instance of a generator should be called
`next<IdentifierTypeName>`. This should maintain readability and can be quickly
recalled when seeing the pattern. It is helpful to define a generator type, so
it can be referenced upstream where generator instances are managed. This is
especially the case for more complex generator signatures, like when having
[enriched identifier types](#enriching-identifier-types).

### Enriching Identifier Types

Some identifiers have some custom behavior and need to carry more information to
fully control identity constrains. Such can be the need to allow for further
restrictions of references. This is usually the case by a complementary property
on the same identified entity. For example, references to Beteiligungen by
a `Rollennummer` might need to be restricted based on the associated
`Rollenbezeichnung`, to control certain relationships between Beteiligungen. Or
similar, the `FortlaufendeNummer` can't be separated into multiple identifier
types, as it requires an overall incrementing counter cross all entities.
However, references via `FortlaufendeNummer` require certain restrictions based
on the related entity.

The basic mechanism to enrich an identifier type is to add an extra generic
parameter. Entities identified by it, must specify the matching parameter.
Generating an identifier is then enforced to adhere to this parametrization.
References on the other hand use the same parameter to restrict themselves.

```typescript
/**
 * Identifier for entities of important kind. Instances are only unique within
 * the XJustiz-Nachricht they are included in.
 *
 * Some identifiers can be produced with an instance of the related generator,
 * obtained by the {@link createSomeIdentifierGenerator} factory.

 * Helpful documentation about the restriction by the generic parameter...
 */
export type SomeIdentifier<
  NachrichtenScope,
  Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal
> = number & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createSomeIdentifierGenerator` factory.";
  readonly unterscheidungsmerkmal: Unterscheidungsmerkmal;
} & WithScope<NachrichtenScope>;

/**
 * Factory to obtain an identifier generator to produce {@link SomeIdentifier} values.
 * Generating a {@link SomeIdentifier} requires to provide the
 * {@link ArtVonUnterscheidungsmerkmal}.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * withScope((scope) => {
 *   const nextSomeIdentifier = createSomeIdentifierGenerator(scope);
 *   const someComposite = {
 *     someIdentifierProperty: nextSomeIdentifier("A"),
 *     // ...
 *   }
 * })
 */
export function createSomeIdentifierGenerator<NachrichtenScope>(
  _scope: WithScope<NachrichtenScope>,
) {
  let nextIdentifier = 1;

  return <Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal>(
    _differentiator: Unterscheidungsmerkmal
  ) =>
    // oxlint-disable-next-line no-unsafe-type-assertion -- explicit cast for branding
    nextIdentifier++ as SomeIdentifier<
      NachrichtenScope,
      Unterscheidungsmerkmal
    >;
  }
}

export type ArtVonUnterscheidungsmerkmal = "A" | "B" | "C";
```
