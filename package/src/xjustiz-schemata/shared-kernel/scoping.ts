import { type Invariant } from "~/metatypes";

/*
 * This is the canonical reference implementation of the scoping pattern. Check
 * out the [documentation](../../../../documentation/patterns/scoping.md) for
 * reasoning and further details. Practical examples can be discovered by
 * inspecting reference usages in the codebase.
 */

/**
 * Auxiliary type that can be used to tag a main type, allowing it to become
 * scoped. This makes the main type generic over a scope, ensuring that
 * instances of different scopes can't be mixed with each other. For example,
 * this can be used with identifiers, which are scoped to a single document.
 *
 * The construction of the main type with unique scopes should then be done
 * using the {@link withScope} function.
 *
 * A heavily simplified example could look like this, using a generically scoped
 * document type with identifiers using scoped "A" and "B":
 * @example
 * ```typescript
 * type MyIdentifier<DocumentScope> = number & WithScope<DocumentScope>;
 * type SomeDocument<Scope> = { identifier: MyIdentifier<Scope> };
 *
 * const firstDocument = { identifier: 0 } as SomeDocument<"A">;
 * const secondDocument = { identifier: 0 } as SomeDocument<"B">;
 * firstDocument.identifier = secondDocument.identifier // compiler error
 * ```
 */
export type WithScope<Scope> = { readonly [TAG]: ScopeGuard<Scope> };

declare const TAG: unique symbol;

/**
 * Produces a unique scope type that is passed securely to a scoped execution
 * block. Thereby, no two instances of a type tagged with the {@link WithScope}
 * auxiliary type can be mixed between two different {@link withScope}
 * invocations. The scope type lives only within the context of a single call.
 *
 * Notice that the scope value itself is a unique symbol at runtime. However, it
 * doesn't provide the same strong security properties as the scope type. In
 * practice, the runtime value should not be used for anything but as carrier of
 * the type at compile-time.
 *
 * In combination with functions that depend on a unique scope, the scope
 * parameter can be forwarded directly without having to deal with any
 * intermediate generics. This makes it a clean developer experience.
 *
 * @example
 * ```typescript
 * const output = withScope((scope) => {
 *  const value = produceSomethingScoped(scope);
 *  // ...
 * });
 *
 * declare function produceSomethingScoped<Scope>(
 *   _scope: ScopeToken<Scope>
 * ): SomethingScoped<Scope>;
 * ```
 * **ATTENTION:**
 * Because the scope is guarded to be invariant, the `Output` type itself can
 * technically NOT be based on the scope. Hence, the scope can only be used
 * internally without leaking outside the {@link withScope} invocation. See the
 * pattern documentation for details — linked at the top of this module.
 */
export function withScope<ScopeFreeOutput>(
  scopedBlock: <UniqueScope>(scope: ScopeToken<UniqueScope>) => ScopeFreeOutput,
): ScopeFreeOutput {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- explicit assertion for branding
  const scope = Symbol(
    "unique scope representative (don't actually use at runtime, compile-time construct)",
  ) as ScopeToken<unknown>;

  return scopedBlock(scope);
}

/**
 * Runtime carrier of a scope as unique symbol, branded with the scope.
 *
 * It is provided as argument to a scoped block when using {@link withScope}. It
 * can be passed around as the carrier of the unique runtime and type-level scope.
 * It is also used to access the singleton instances of the scope via
 * {@link scopedSingleton}.
 *
 * **ATTENTION:**
 * Don't use this to make a type scoped itself. Strictly use {@link WithScope}
 * instead. The token is based on a symbol. Intersections with other primitive
 * types silently result into `never`.
 */
export type ScopeToken<Scope> = symbol & WithScope<Scope>;

/**
 * Returns one instance of `createSingleton` for the given `scope` and `key`.
 *
 * Anything constructed only ever once per scope should go through here. For
 * example, identifier generators. Calling the function multiple times with the
 * same `scope` and `key` yields the same instance - the scoped singleton.
 * Instances live as long as the scope. They become inaccessible once the scope
 * ends and will be automatically garbage collected.
 *
 * **ATTENTION:**
 * A `key` must be a constant value that doesn't change during the lifetime of
 * a scope. A common approach is to use a module-level constant.
 *
 * ```typescript
 * withScope((scope) => {
 *   const cache = getCache(scope);
 *   cache.foo = "new value";
 *   const sameCache = getCache(scope);
 *   assert(sameCache.foo === "new value");
 *   assert(Object.is(cache, sameCache));
 * })
 *
 * withScope((scope) => {
 *   const cache = getCache(scope);
 *   assert(cache.foo === "bar");
 * })
 *
 * function getCache<Scope>(scope: ScopeToken<Scope>) {
 *   return scopedSingleton(scope, CACHE_KEY, () => ({ foo: "bar" }));
 * }
 *
 * const CACHE_KEY = Symbol('my-singleton-cache-of-scope');
 * ```
 */
export function scopedSingleton<Scope, Singleton extends NonNullable<unknown>>(
  scope: ScopeToken<Scope>,
  key: symbol,
  createSingleton: () => Singleton,
): Singleton {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const registryOfScope = getOrInsertDefault(
    SINGLETON_REGISTRY_PER_SCOPE,
    scope,
    () => new Map(),
  ) as Map<symbol, Singleton>;

  return getOrInsertDefault(registryOfScope, key, createSingleton);
}

function getOrInsertDefault<
  Key extends symbol,
  Value extends NonNullable<unknown>,
>(
  map: Readonly<Map<Key, Value> | WeakMap<Key, Value>>,
  key: Key,
  getDefault: () => Value,
) {
  const value = map.get(key);

  if (value !== undefined) {
    return value;
  }

  const defaultValue = getDefault();
  map.set(key, defaultValue);
  return defaultValue;
}

const SINGLETON_REGISTRY_PER_SCOPE = new WeakMap<
  symbol,
  Map<symbol, unknown>
>();

/**
 * The guard of a scope ensures that `ScopeGuard<ScopeOne>` and
 * `ScopeGuard<ScopeTwo>` are never mutually assignable, except if `ScopeOne` and
 * `ScopeTwo` are truly identical.
 */
type ScopeGuard<Scope> = Invariant<Scope>;

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("scoping", () => {
    describe("with scope", () => {
      it("calls the given callable", () => {
        const callable = vi.fn(() => "some output");

        const output = withScope(callable);

        expect(callable).toHaveBeenCalledOnce();
        expect(output).toEqual("some output");
      });

      it("provides a unique scope per call", () => {
        type SomethingScoped<Scope> = string & WithScope<Scope>;

        withScope(<OuterScope>(_outerScope: ScopeToken<OuterScope>) => {
          const valueInOuterScope = "value" as SomethingScoped<OuterScope>; // oxlint-disable-line

          withScope(<InnerScope>(_innerScope: ScopeToken<InnerScope>) => {
            // @ts-expect-error -- type testing on a level unsupported by Vitest
            valueInOuterScope satisfies SomethingScoped<InnerScope>;
          });
        });
      });

      it("prevents the output from depending on the scope itself", () => {
        type OutputWithScope<Scope> = string & WithScope<Scope>;

        withScope(
          // @ts-expect-error -- type testing on a level unsupported by Vitest
          <Scope>(_scope: ScopeToken<Scope>): OutputWithScope<Scope> => "foo",
        );
      });
    });

    describe("scoped singleton", () => {
      it("returns the same instance when called multiple times", () => {
        withScope((scope) => {
          expect(getCache(scope)).toBe(getCache(scope));
        });
      });

      it("returns a new instance for a different scope", () => {
        withScope((scope) => {
          const cache = getCache(scope);
          cache.foo = "new value";
        });

        withScope((scope) => {
          const cache = getCache(scope);
          expect(cache.foo).not.toEqual("new value");
        });
      });

      it("allows for multiple singletons", () => {
        const FIRST_KEY = Symbol("first-test-key");
        const SECOND_KEY = Symbol("second-test-key");

        withScope((scope) => {
          const firstSingleton = scopedSingleton(scope, FIRST_KEY, () => ({
            foo: "bar",
          }));

          const secondSingleton = scopedSingleton(scope, SECOND_KEY, () => ({
            foo: "bar",
          }));

          expect(firstSingleton).not.toBe(secondSingleton);
          expect(firstSingleton).toStrictEqual({ foo: "bar" });
          expect(secondSingleton).toStrictEqual({ foo: "bar" });
        });
      });

      function getCache<Scope>(scope: ScopeToken<Scope>) {
        return scopedSingleton(scope, CACHE_KEY, () => ({ foo: "bar" }));
      }

      const CACHE_KEY = Symbol("test-key");
    });
  });
}
