# Scoping

## Problem

In the schemata for the XJustiz standard, there are multiple (implicit)
identifier constraints. For example, the requirement that an identifier must be
unique among its kind within the same XJustiz-Nachricht (e.g. fortlaufende
Nummern). Furthermore, it's important that identifiers that occur as reference,
actually point to entities within the same Nachricht. Like for the relationship
between Beteiligungen (participants) or references to documents of evidence. So
there are multiple constraints that must hold true for a given scope — usually
the document of a single XJustiz-Nachricht.

Notice that using the new-type pattern based on [type
branding](./type-branding.md) does prevent mixing different kind of identifiers
for different entities. This is especially important for references. For
example, avoid passing a reference by an identifier for a participant where
an evidence document is expected. However, this pattern can't prevent mixing
identifiers of the same kind between different scopes (read:
XJustiz-Nachrichten). Like passing an identifier for a participant that is
defined in a different Nachricht.

In addition certain things must have a single instance per scope. Most prominent
example are identifier generators that produce a unique sequence should only
every exist once per scope. Therefore, it is necessary to protect the
construction as scoped singletons — enforcing safe usage.

## Solution

Types that represent identifiers get tagged with an auxiliary type for scoping.
In addition, a utility function provides the context for unique scope injection
with a token. This token can also be used to access the singleton registry of
a scope.

### Auxiliary Type

The auxiliary type by the [reference
implementation](../../package/src/xjustiz-schemata/shared-kernel/scoping.ts) is
called `WithScope` and uses [type branding](./type-branding.md). The scope
itself becomes a generic type parameter, making the same scoped type
distinguishable for different scopes. The tag of this brand has a scope guard as
value. That guard ensures that scopes are invariant. In result, no two scoped
types can be mixed with each other, unless they truly share the exact equal
scope.

The following snippet shows how to define scoped type, based on a main `number`
type:

```typescript
type SomethingScoped<Scope> = number & WithScope<Scope>;
```

Given the scoped type, the following assignments quickly demonstrate how the
distinction by scope works. Even though there is a

```typescript
let foo = 0 as SomethingScoped<string>;
let bar = 0 as SomethingScoped<"Some Scope">;
let baz = 0 as SomethingScoped<"Some Scope" | "Other Scope">;

// All assignments cause compiler errors due to the invariant scope guard.
foo = bar; // contravariant, but not covariant
foo = baz; // contravariant, but not covariant
bar = baz; // contravariant, but not covariant
bar = foo; // covariant, but not contravariant
baz = bar; // covariant, but not contravariant
baz = foo; // covariant, but not contravariant
```

### Unique Scopes

While the auxiliary type makes sure that no two scopes can be mixed, scopes must
still be named. Creating unique scopes can be a challenge. Additionally, as long
as a scope can be named, it is possible to produce values that match the scope.
For the context of XJustiz-Nachrichten, it is often desirable to ensure that
scoped values like for identifier types can never be mixed. Neither by accident,
nor intentionally.

The solution is a rank-2 generic function that provides an opaque generic scope
token to a scoped execution block. In result, every invocation of this utility
function produces a truly unique scope type that is impossible to name. The
implementation itself is basically just the function signature itself:

```typescript
declare function withScope<ScopeFreeOutput>(
  scopedBlock: <UniqueScope>(scope: ScopeToken<UniqueScope>) => ScopeFreeOutput,
): ScopeFreeOutput;
```

The unique scope type is carried by a token value, based on a unique runtime
symbol. The token can be passed around for anything that generically depends on
a scope — including for [scoped singletons](#scoped-singletons).

Because scopes are guarded to be invariant, this is so strong, that it is not
possible to leak any value generic to the scope outside this function call. Not
even as `unknown` or `any`. In practice this means that identifiers, generated in
the context of composing a single XJustiz-Nachricht, can never escape the
context of this function call. This only works, if the output does either not
contain any scoped type instance or contain them in an unbranded representation.
This is safe, because this way they can't be wrongly used as valid branded types
anymore. This can be achieved for example by serialized the output, like an XML
document for an XJustiz-Nachricht.

A full example how to use this could look like that:

```typescript
const output = withScope((scope) => {
  const identifier = generateIdentifier(scope);
  const entity = { identifier, foo: "bar", baz: true };
  return JSON.stringify(entity);
});
```

### Scoped Singletons

Scoped singletons solve the problem that certain things must exist only ever
once in a scope. The scope token can be used as to access a registry of
singletons that lives only as long as the scope. Each singleton is identified by
it's own unique key. The combination of scope token and singleton key is unique
and always provides the same singleton instance. The instance will be created on
first access.

```typescript
withScope((scope) => {
  const cache = getCache(scope);
  cache.foo = "new value";
  const sameCache = getCache(scope);
  assert(sameCache.foo === "new value");
  assert(Object.is(cache, sameCache));
});

function getCache<Scope>(scope: ScopeToken<Scope>) {
  return scopedSingleton(scope, CACHE_KEY, () => ({ foo: "bar" }));
}

const CACHE_KEY = Symbol("my-singleton-cache-of-scope");
```
