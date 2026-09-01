import {
  type ScopeToken,
  scopedSingleton,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import {
  type WithIdentifierCapabilities,
  memorizeAsGenerator,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type Increment } from "~/metatypes";

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
export type UUID<
  NachrichtenScope,
  Ordinal extends number = number,
> = UUIDValue &
  WithIdentifierCapabilities<UUIDValue, NachrichtenScope, Ordinal>;

type UUIDValue = string & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createUuidGenerator` factory.";
};

declare const TAG: unique symbol;

/**
 * Factory to obtain an identifier generator to produce {@link UUID} values.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const uuid = createUuidGenerator(scope);
 *   const eigeneNachrichtenID = uuid.first(),
 *   const absender = {
 *     eigeneNachrichtenID,
 *     // ...
 *   }
 * })
 * ```
 */
export function createUuidGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): UuidGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(scope, UUID_GENERATOR_KEY, () =>
    memorizeAsGenerator(randomUUID),
  ) as never;
}

const UUID_GENERATOR_KEY = Symbol("uuid-generator");

function randomUUID(): UUIDValue {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return globalThis.crypto.randomUUID() as UUIDValue;
}

export interface UuidGenerator<NachrichtenScope> {
  first: () => UUID<NachrichtenScope, 0>;
  next: <Ordinal extends number>(
    previous: UUID<NachrichtenScope, Ordinal>,
  ) => UUID<NachrichtenScope, Increment<Ordinal>>;
}

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

      it("produces unique runtime values for a meaningful number of generations", () => {
        const generatedUUIDs = new Set<string>();

        repeat(1000, () => {
          const uuid = randomUUID();
          expect(generatedUUIDs.has(uuid)).toBe(false);
          generatedUUIDs.add(uuid);
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
