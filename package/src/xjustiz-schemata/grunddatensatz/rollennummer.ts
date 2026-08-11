import {
  type DatatypeC,
  datatypeC,
} from "~/xjustiz-schemata/din-91379/datatypeC";
import {
  type ScopeToken,
  type WithScope,
  scopedSingleton,
  withScope,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import {
  type Beteiligung, // oxlint-disable-line no-unused-vars -- reference by TSDoc
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";

declare const TAG: unique symbol;

/**
 * UUID dedicated to identifier Beteiligte by one of their specific Rollen.
 * Notice that the XJustiz standard itself requires only arbitrary
 * {@link DatatypeC} values here. Produced values depend on the global
 * {@link crypto} generator and are expected to be of version 4 — general purpose
 * and fully random.
 *
 * Rollennummern can be produced with an instance of the related generator,
 * obtained by the {@link createRollennummerGenerator} factory.
 *
 * A {@link Rollennummer} can be associated with a {@link Rollenbezeichnung}
 * based on their shared context of a Rolle for a {@link Beteiligung}. When an
 * instance is generated, it will be automatically associated based on the
 * related {@link Rollenbezeichnung} of the Rolle.
 * The associated {@link Rollenbezeichnung} is used for type restrictions. For
 * example, when referencing a {@link Beteiligung} by one of their
 * {@link Rollennummer}n, there might be limitations applied in regards which
 * kind of roles (read: Bezeichnung) that {@link Beteiligung} is allowed to have.
 * Like for the relationship between a layer and plaintiff. An association with
 * the raw {@link Rollenbezeichnung} type means no restrictions/specification —
 * all are allowed.
 */
/*
 * In the XJustiz standard, this is a plain DatatypeC only. So it can be
 * anything. To have a full secure and dedicated identifier type, we need to
 * have a generator. A UUID is just the most straightforward solution that is
 * already established. And it fits into a DatatypeC.
 */
export type Rollennummer<
  NachrichtenScope,
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung = Rollenbezeichnung,
> = DatatypeC & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createRollennummerGenerator` factory.";
  readonly zugehoerigeRollenbezeichnung: ZugehoerigeRollenbezeichnung;
} & WithScope<NachrichtenScope>;

export type RollennummerGenerator<NachrichtenScope> = <
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung,
>(
  zugehoerigeRollenbezeichnung: ZugehoerigeRollenbezeichnung,
) => Rollennummer<NachrichtenScope, ZugehoerigeRollenbezeichnung>;

/**
 * Factory to obtain an identifier generator to produce {@link Rollennummer}
 * values. Generating a {@link Rollennummer} requires to provide the zugehörige
 * {@link Rollenbezeichnung}.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const nextRollennummer = createRollennummerGenerator(scope);
 *   const rolle = {
 *     rollennummer: nextRollennummer(Rollenbezeichnung.Klaeger),
 *     rollenbezeichnung: Rollenbezeichnung.Klaeger,
 *     // ...
 *   }
 * })
 * ```
 */
export function createRollennummerGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): RollennummerGenerator<NachrichtenScope> {
  return scopedSingleton(
    scope,
    ROLLENNUMMER_GENERATOR_KEY,
    () =>
      <ZugehoerigeRollenbezeichnung extends Rollenbezeichnung>(
        _zugehoerigeRollenbezeichnung: ZugehoerigeRollenbezeichnung,
      ) => {
        const uuid = datatypeC(globalThis.crypto.randomUUID());

        if (uuid.issues) {
          // No control over runtime environment provided cryptography. SHOULD never happen!
          throw new TypeError(
            "Generated UUID is unexpectedly no valid Datatype C",
          );
        } else {
          // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
          return uuid.value as Rollennummer<
            NachrichtenScope,
            ZugehoerigeRollenbezeichnung
          >;
        }
      },
  );
}

const ROLLENNUMMER_GENERATOR_KEY = Symbol("rollennummer-generator");

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("Rollennummer", () => {
    describe("generator", async () => {
      /*
       * Test cases uses loops to repeatably exercise the generator and test for
       * the same property. This is a bit part of the nature when testing such
       * impure functions. But that means these test cases are just a best effort
       * and might find flaws over time when runs have accumulated enough.
       */

      const { Rollenbezeichnung } = await import(
        "~/xjustiz-schemata/grunddatensatz/codelisten"
      );

      it("produces unique identifiers for a meaningful sequence length", () => {
        withScope((scope) => {
          const nextRollennummer = createRollennummerGenerator(scope);
          const generatedRollennummern = new Set<string>();

          repeat(1000, () => {
            const rollennummer = nextRollennummer(Rollenbezeichnung.Beklagter);
            expect(generatedRollennummern.has(rollennummer)).toBe(false);
            generatedRollennummern.add(rollennummer);
          });
        });
      });

      it("produces actually valid Datatype C values", () => {
        withScope((scope) => {
          const nextRollennummer = createRollennummerGenerator(scope);

          repeat(1000, () => {
            const rollennummer = nextRollennummer(Rollenbezeichnung.Beklagter);
            expect(datatypeC(rollennummer)).toStrictEqual({
              value: rollennummer,
            });
          });
        });
      });

      it("doesn't throw an exception unexpectedly", () => {
        withScope((scope) => {
          const nextRollennummer = createRollennummerGenerator(scope);

          repeat(1000, () => {
            expect(() =>
              nextRollennummer(Rollenbezeichnung.Beklagter),
            ).not.toThrow();
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
