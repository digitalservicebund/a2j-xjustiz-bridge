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
import { type Increment } from "~/metatypes";

/**
 * Fortlaufende Nummern are positive integers that are continuously incremented.
 * They are only unique within the scope of a single XJustiz-Nachricht and can't
 * be used for cross references. It is used to identify entities like Fristen or
 * (Zins)Ansprüche.
 *
 * Fortlaufende Nummern can be produced with an instance of the related
 * generator, obtained by the {@link createFortlaufendeNummerGenerator} factory.
 *
 * A Fortlaufende Nummer must be associated with a `Bezugselement` it relates to.
 * It is used for type restrictions within composites, especially to correctly
 * specify requirements for references. This closes an ambiguous gap in the
 * XJustiz standard.
 */
export type FortlaufendeNummer<
  NachrichtenScope,
  Bezugselement extends ArtVonBezugselement,
  Ordinal extends number = number,
> = FortlaufendeNummerValue & {
  readonly [BEZUGSELEMENT]: Bezugselement;
} & WithIdentifierCapabilities<
    FortlaufendeNummerValue,
    NachrichtenScope,
    Ordinal
  >;

type FortlaufendeNummerValue = PositiveInteger & {
  readonly [TAG]: "Use a generator instance to produce values, obtained by the `createFortlaufendeNummerGenerator` factory.";
};

declare const TAG: unique symbol;
declare const BEZUGSELEMENT: unique symbol;
export type ArtVonBezugselement = "Anspruch" | "Zinsanspruch";

/**
 * Factory to obtain an identifier generator to produce
 * {@link FortlaufendeNummer} values. Generating a {@link FortlaufendeNummer}
 * requires to provide the {@link ArtVonBezugselement}.
 *
 * Generators are automatically scoped singletons. Multiple factory calls for the
 * same scope result in the exact same generator instance.
 *
 * @example
 * ```typescript
 * withScope((scope) => {
 *   const fortlaufendeNummer = createFortlaufendeNummerGenerator(scope);
 *   const anspruch = {
 *     fortlaufendeNummer: fortlaufendeNummer.first("Anspruch"),
 *     // ...
 *   }
 * })
 * ```
 */
export function createFortlaufendeNummerGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): FortlaufendeNummerGenerator<NachrichtenScope> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gain generator type capabilities
  return scopedSingleton(
    scope,
    FORTLAUFENDE_NUMMER_GENERATOR_KEY,
    () => FortlaufendeNummerProducer,
  ) as unknown as FortlaufendeNummerGenerator<NachrichtenScope>;
}

const FORTLAUFENDE_NUMMER_GENERATOR_KEY = Symbol(
  "fortlaufende-nummer-generator",
);

const FortlaufendeNummerProducer: NonDistinctiveGenerator<FortlaufendeNummerValue> =
  {
    // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
    first: () => positiveInteger(1).value as FortlaufendeNummerValue,
    // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
    next: (previous) => increment(previous) as FortlaufendeNummerValue,
  };

interface FortlaufendeNummerGenerator<NachrichtenScope> {
  first: <Bezugselement extends ArtVonBezugselement>(
    bezugselement: Bezugselement,
  ) => FortlaufendeNummer<NachrichtenScope, Bezugselement, 0>;

  next: <Bezugselement extends ArtVonBezugselement, Ordinal extends number>(
    previous: FortlaufendeNummer<
      NachrichtenScope,
      ArtVonBezugselement,
      Ordinal
    >,
    bezugselement: Bezugselement,
  ) => FortlaufendeNummer<NachrichtenScope, Bezugselement, Increment<Ordinal>>;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("Fortlaufende Nummer", async () => {
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    describe("sequencer", () => {
      it("produces number 1 as first identifier", () => {
        withScope((scope) => {
          const fortlaufendeNummer = createFortlaufendeNummerGenerator(scope);

          expect(fortlaufendeNummer.first("Anspruch")).toStrictEqual(1);
        });
      });

      it("produces a sequence of 'fortlaufende' numbers strictly incrementing by one", () => {
        let lastFortlaufendeNummer = FortlaufendeNummerProducer.first();

        repeat(100, () => {
          const nextFortlaufendeNummer = FortlaufendeNummerProducer.next(
            lastFortlaufendeNummer,
          );

          expect(nextFortlaufendeNummer).toStrictEqual(
            lastFortlaufendeNummer + 1,
          );

          lastFortlaufendeNummer = nextFortlaufendeNummer;
        });
      });

      it("produces unique identifier for a meaningful sequence length", () => {
        let lastFortlaufendeNummer = FortlaufendeNummerProducer.first();
        const generatedFortlaufendeNummern = new Set<number>([
          lastFortlaufendeNummer,
        ]);

        repeat(100, () => {
          const nextFortlaufendeNummer = FortlaufendeNummerProducer.next(
            lastFortlaufendeNummer,
          );

          expect(generatedFortlaufendeNummern.has(nextFortlaufendeNummer)).toBe(
            false,
          );

          generatedFortlaufendeNummern.add(nextFortlaufendeNummer);
          lastFortlaufendeNummer = nextFortlaufendeNummer;
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
