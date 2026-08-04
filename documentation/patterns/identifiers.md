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
 */
export type SomeIdentifier<NachrichtenScope> = number & {
  readonly [TAG]: "Identifiers can not be constructed manually.";
} & WithScope<NachrichtenScope>;
```

### Generators

Each module of an identifier also exposes a function that can construct new
generator instances. An instance must produce unique identifiers for the scope
they are related to. Generators fall under the class of smart constructors in
the context of branded new-types. They are the only unit that is allowed to
assert the compiler valid instances of the identifier type. Generators are also
meant to play well together with the [`withScope`](./scoping.md#unique-scopes)
function, receiving a uniquely typed scope symbol as parameter.

```typescript
export function createSomeIdentifierGenerator<NachrichtenScope>(
  _scope: WithScope<NachrichtenScope>,
): () => SomeIdentifier<NachrichtenScope> {
  let nextIdentifier = 1;
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit cast for branding
  return () => nextIdentifier++ as SomeIdentifier<NachrichtenScope>;
}

// Somewhere else:
withScope((scope) => {
  const nextIdentifier = createSomeIdentifierGenerator(scope);
  const someEntity = { identifier: nextIdentifier() };
});
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
recalled when seeing the pattern.

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
type ArtVonUnterscheidungsmerkmal = "A" | "B" | "C";

/**
 * Identifier for entities of important kind. Instances are only unique within
 * the XJustiz-Nachricht they are included in.
 *
 * Some helpful documentation about the restriction by the generic parameter.
 */
export type SomeIdentifier<
  NachrichtenScope,
  Unterscheidungsmerkmal extends ArtVonUnterscheidungsmerkmal
> = number & {
  readonly [TAG]: "Identifiers can not be constructed manually.";
  readonly unterscheidungsmerkmal: Unterscheidungsmerkmal;
} & WithScope<NachrichtenScope>;

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
```

### Accessibility & Responsibility

Branding, scoping, and a dedicated generator solve the majority of problems
to a high extend. However, there is still the challenge to avoid dangling
references. If anyone can create new identifiers, it doesn't matter if they are
scoped and separated from each other: you can just get an identifier, use it as
reference and move on. But there is no entity that can actually be identified by
this identifier. But even if the identifier would be used to construct an
entity, it is still possible to forget about this entity.

Therefore, it is necessary that library users can not access generators
directly. The library must remain fully responsible to automatically generate
identifiers for newly created entities and take care that none can be forgotten.
This is the responsibility of the message orchestrators.

Because the identifier type itself will be exposed to library users, the
provided documentation should make a point about the practical usage. Also the
branding tag should be extended for this.

```typescript
/**
 * Identifier for entities of important kind. Instances are only unique within
 * the XJustiz-Nachricht they are included in.
 *
 * The generation of identifiers is protected. The provided context of a message
 * orchestrator provides the necessary capabilities to produce entities with
 * automatic identifier generation for the correct scope. This helps to ensure
 * that identities are handled securely and correctly.
 */
export type SomeIdentifier<NachrichtenScope> = number & {
  readonly [TAG]: "Identifiers can not be constructed manually. Use the provided context to produce entities with automatic identifier generation.";
} & WithScope<NachrichtenScope>;
```
