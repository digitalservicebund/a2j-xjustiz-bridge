import {
  type ScopeToken,
  type WithScope,
  scopedSingleton,
  withScope,
} from "~/xjustiz-schemata/shared-kernel/scoping";

declare const TAG: unique symbol;

/**
 * Universally unique identifier — used to identify various different entities
 * (e.g. Dokumente, Vorträge, or Nachrichten). A UUID is globally unique and can
 * reference entities cross XJustiz-Nachrichten.
 * Produced values depend on the global {@link crypto} generator and are expected
 * to be of version 4 — general purpose and fully random.
 *
 * UUIDs can be produced with an instance of the related generator, obtained by
 * the {@link createUuidGenerator} factory.
 */
export type UUID<NachrichtenScope> = string & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createUuidGenerator` factory.";
} & WithScope<NachrichtenScope>;

export type UUIDGenerator<NachrichtenScope> = () => UUID<NachrichtenScope>;

/**
 * Factory to obtain an identifier generator to produce {@link UUID} values.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const nextUUID = createUuidGenerator(scope);
 *   const absender = {
 *     eigeneNachrichtenID: nextUUID(),
 *     // ...
 *   }
 * })
 * ```
 */
export function createUuidGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): UUIDGenerator<NachrichtenScope> {
  return scopedSingleton(
    scope,
    UUID_GENERATOR_KEY,
    () => () =>
      // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
      globalThis.crypto.randomUUID() as UUID<NachrichtenScope>,
  );
}

const UUID_GENERATOR_KEY = Symbol("uuid-generator");

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("UUID", () => {
    describe("generator", () => {
      /*
       * Test cases uses loops to repeatably exercise the generator and test for
       * the same property. This is a bit part of the nature when testing such
       * impure functions. But that means these test cases are just a best effort
       * and might find flaws over time when runs have accumulated enough.
       */

      it("produces unique identifiers for a meaningful sequence length", () => {
        withScope((scope) => {
          const nextUUID = createUuidGenerator(scope);
          const generatedUUIDs = new Set<string>();

          repeat(1000, () => {
            const uuid = nextUUID();
            expect(generatedUUIDs.has(uuid)).toBe(false);
            generatedUUIDs.add(uuid);
          });
        });
      });
    });
  });

  function repeat(times: number, callable: () => void): void {
    for (let counter = 0; counter < times; counter++) {
      callable();
    }
  }
}
