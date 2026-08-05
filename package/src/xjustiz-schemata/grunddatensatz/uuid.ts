import {
  type WithScope,
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
 * The generation of identifiers is protected. The provided context of a message
 * orchestrator provides the necessary capabilities to produce entities with
 * automatic identifier generation for the correct scope. This helps to ensure
 * that identities are handled securely and correctly.
 */
export type UUID<NachrichtenScope> = string & {
  readonly [TAG]: "Identifiers can not be constructed manually. Use the provided context to produce entities with automatic identifier generation.";
} & WithScope<NachrichtenScope>;

export type UUIDGenerator<NachrichtenScope> = () => UUID<NachrichtenScope>;

export function createUuidGenerator<NachrichtenScope>(
  _scope: WithScope<NachrichtenScope>,
): UUIDGenerator<NachrichtenScope> {
  return () =>
    // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
    globalThis.crypto.randomUUID() as UUID<NachrichtenScope>;
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
