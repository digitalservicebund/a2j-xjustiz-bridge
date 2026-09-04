import {
  type DatatypeC,
  datatypeC,
} from "~/xjustiz-schemata/din-91379/datatypeC";
import {
  type ScopeToken,
  scopedSingleton,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import {
  type WithIdentifierCapabilities,
  memorizeAsGenerator,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import {
  type Beteiligung, // oxlint-disable-line no-unused-vars -- reference by TSDoc
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";

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
  Ordinal extends number = number,
> = RollennummerValue & {
  readonly [ZUGEHOERIGE_ROLLENBEZEICHNUNG]: ZugehoerigeRollenbezeichnung;
} & WithIdentifierCapabilities<RollennummerValue, NachrichtenScope, Ordinal>;

type RollennummerValue = DatatypeC & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createRollennummerGenerator` factory.";
};

declare const TAG: unique symbol;
declare const ZUGEHOERIGE_ROLLENBEZEICHNUNG: unique symbol;

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
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerFuerKlaeger = rollennummer(Rollenbezeichnung.Klaeger);
 *   const rolle = {
 *     rollennummer: rollennummerFuerKlaeger,
 *     rollenbezeichnung: Rollenbezeichnung.Klaeger,
 *     // ...
 *   }
 * })
 * ```
 */
export function createRollennummerGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): RollennummerGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(scope, ROLLENNUMMER_GENERATOR_KEY, () =>
    memorizeAsGenerator(randomRollennummer),
  ) as never;
}

const ROLLENNUMMER_GENERATOR_KEY = Symbol("rollennummer-generator");

function randomRollennummer(): RollennummerValue {
  const uuid = datatypeC(globalThis.crypto.randomUUID());

  if (uuid.issues) {
    // No control over runtime environment provided cryptography. SHOULD never happen!
    throw new TypeError("Generated UUID is unexpectedly no valid Datatype C");
  } else {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- explicit assertion for branding
    return uuid.value as RollennummerValue;
  }
}

/**
 * **ATTENTION:**
 * Incrementing ordinals for generated identifiers are currently turned off,
 * because of technical limitations to enable dynamic input lists.
 */
interface RollennummerGenerator<NachrichtenScope> {
  first: <ZugehoerigeRollenbezeichnung extends Rollenbezeichnung>(
    zugehoerigeRollenbezeichnung: ZugehoerigeRollenbezeichnung,
  ) => Rollennummer<
    NachrichtenScope,
    ZugehoerigeRollenbezeichnung
    // Turned off: static Ordinal of 0
  >;

  next: <
    ZugehoerigeRollenbezeichnung extends Rollenbezeichnung,
    Ordinal extends number,
  >(
    previous: Rollennummer<NachrichtenScope, Rollenbezeichnung, Ordinal>,
    zugehoerigeRollenbezeichnung: ZugehoerigeRollenbezeichnung,
  ) => Rollennummer<
    NachrichtenScope,
    ZugehoerigeRollenbezeichnung
    // Turned off: Increment<Ordinal>
  >;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("Rollennummer", () => {
    describe("generator", () => {
      /*
       * Test cases uses loops to repeatably exercise the generator and test for
       * the same property. This is a bit part of the nature when testing such
       * impure functions. But that means these test cases are just a best effort
       * and might find flaws over time when runs have accumulated enough.
       */

      it("produces unique runtime values for a meaningful number of generations", () => {
        const generatedRollennummern = new Set<string>();

        repeat(1000, () => {
          const rollennummer = randomRollennummer();
          expect(generatedRollennummern.has(rollennummer)).toBe(false);
          generatedRollennummern.add(rollennummer);
        });
      });

      it("produces actually valid Datatype C values", () => {
        repeat(1000, () => {
          const rollennummer = randomRollennummer();

          expect(datatypeC(rollennummer)).toStrictEqual({
            value: rollennummer,
          });
        });
      });

      it("doesn't throw an exception unexpectedly", () => {
        repeat(1000, () => {
          expect(randomRollennummer).not.toThrow();
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
