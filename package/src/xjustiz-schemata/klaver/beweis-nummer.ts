import {
  type NonDistinctiveGenerator,
  type WithIdentifierCapabilities,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import {
  type PositiveInteger,
  increment,
  positiveInteger,
} from "~/xjustiz-schemata/xml-schema-definition/positive-integer";
import {
  type ScopeToken,
  scopedSingleton,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import { type Beweis } from "./composites"; // oxlint-disable-line no-unused-vars -- referenced by TSDoc
import { type Increment } from "~/metatypes";

/**
 * Beweis Nummern are positive integers to identity {@link Beweis}e. They are
 * only unique within the scope of a single XJustiz-Nachricht and can't be used
 * for cross references. Because the XJustiz standard does not provide further
 * specification, Beweis Nummern are continuously incremented, following common
 * practices.
 *
 * Beweis Nummern can be produced with an instance of the related generator,
 * obtained by the {@link createBeweisNummerGeneratorGenerator} factory.
 */
export type BeweisNummer<
  NachrichtenScope,
  Ordinal extends number = number,
> = BeweisNummerValue &
  WithIdentifierCapabilities<BeweisNummerValue, NachrichtenScope, Ordinal>;

type BeweisNummerValue = PositiveInteger & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createBeweisNummerGenerator` factory.";
};

declare const TAG: unique symbol;

/**
 * Factory to obtain an identifier generator to produce {@link BeweisNummer}
 * values.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const beweisNummer = createBeweisNummerGenerator(scope);
 *   const beweisNummerFuerZeugen = beweisNummer.first();
 *   const beweis = {
 *     beweisNummer: beweisNummerFuerZeugen,
 *     // ...
 *   }
 * })
 * ```
 */
export function createBeweisNummerGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): BeweisNummerGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(
    scope,
    BEWEIS_NUMMER_GENERATOR_KEY,
    () => BeweisNummerProducer,
  ) as unknown as BeweisNummerGenerator<NachrichtenScope>;
}

const BEWEIS_NUMMER_GENERATOR_KEY = Symbol("beweis-nummer-generator");

const BeweisNummerProducer: NonDistinctiveGenerator<BeweisNummerValue> = {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  first: () => positiveInteger(1).value as BeweisNummerValue,
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  next: (previous) => increment(previous) as BeweisNummerValue,
};

interface BeweisNummerGenerator<NachrichtenScope> {
  first: () => BeweisNummer<NachrichtenScope, 0>;

  next: <Ordinal extends number>(
    previous: BeweisNummer<NachrichtenScope, Ordinal>,
  ) => BeweisNummer<NachrichtenScope, Increment<Ordinal>>;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("Fortlaufende Nummer", async () => {
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    describe("sequencer", () => {
      it("produces number 1 as first identifier", () => {
        withScope((scope) => {
          const beweisNummer = createBeweisNummerGenerator(scope);

          expect(beweisNummer.first()).toStrictEqual(1);
        });
      });

      it("produces a sequence of continuous numbers strictly incrementing by one", () => {
        let lastBeweisNummer = BeweisNummerProducer.first();

        repeat(100, () => {
          const nextBeweisNummer = BeweisNummerProducer.next(lastBeweisNummer);

          expect(nextBeweisNummer).toStrictEqual(lastBeweisNummer + 1);

          lastBeweisNummer = nextBeweisNummer;
        });
      });

      it("produces unique identifier for a meaningful sequence length", () => {
        let lastBeweisNummer = BeweisNummerProducer.first();
        const generatedBeweisNummern = new Set<number>([lastBeweisNummer]);

        repeat(100, () => {
          const nextBeweisNummer = BeweisNummerProducer.next(lastBeweisNummer);

          expect(generatedBeweisNummern.has(nextBeweisNummer)).toBe(false);

          generatedBeweisNummern.add(nextBeweisNummer);
          lastBeweisNummer = nextBeweisNummer;
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
