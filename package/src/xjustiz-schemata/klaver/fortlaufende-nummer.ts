import {
  type PositiveInteger,
  increment,
  positiveInteger,
} from "~/xjustiz-schemata/xml-schema-definition/positive-integer";
import {
  type ScopeToken,
  type WithScope,
  scopedSingleton,
} from "~/xjustiz-schemata/shared-kernel/scoping";

declare const TAG: unique symbol;

/**
 * Fortlaufende Nummern are positive integers that are continuously incremented.
 * They are only unique within the scope of a single XJustiz-Nachricht and can't
 * be used for cross references. It is used to identify entities like Fristen or
 * (Zins)Ansprüche.
 *
 * The generation of identifiers is protected. The provided context of a message
 * orchestrator provides the necessary capabilities to produce entities with
 * automatic identifier generation for the correct scope. This helps to ensure
 * that identities are handled securely and correctly.
 */
export type FortlaufendeNummer<
  NachrichtenScope,
  Bezugselement extends ArtVonBezugselement,
> = PositiveInteger & {
  readonly [TAG]: "Identifiers can not be constructed manually. Use the provided context to produce entities with automatic identifier generation.";
  readonly bezugselement: Bezugselement;
} & WithScope<NachrichtenScope>;

type ArtVonBezugselement = "Anspruch" | "Zinsanspruch";

export type FortlaufendeNummerGenerator<NachrichtenScope> = <
  Bezugselement extends ArtVonBezugselement,
>(
  bezugselement: Bezugselement,
) => FortlaufendeNummer<NachrichtenScope, Bezugselement>;

export function createFortlaufendeNummerGenerator<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): FortlaufendeNummerGenerator<NachrichtenScope> {
  return scopedSingleton(scope, FORTLAUFENDE_NUMMER_GENERATOR_KEY, () => {
    let nextFortlaufendeNummer = positiveInteger(1).value;

    return <Bezugselement extends ArtVonBezugselement>(
      _bezugselement: Bezugselement,
    ) => {
      const currentFortlaufendeNummer = nextFortlaufendeNummer;
      nextFortlaufendeNummer = increment(nextFortlaufendeNummer);
      // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
      return currentFortlaufendeNummer as unknown as FortlaufendeNummer<
        NachrichtenScope,
        Bezugselement
      >;
    };
  });
}

const FORTLAUFENDE_NUMMER_GENERATOR_KEY = Symbol(
  "fortlaufende-nummer-generator",
);

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("Fortlaufende Nummer", async () => {
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    describe("generator", () => {
      it("produces number 1 as first identifier", () => {
        withScope((scope) => {
          const nextFortlaufendeNummer =
            createFortlaufendeNummerGenerator(scope);

          expect(nextFortlaufendeNummer("Anspruch")).toStrictEqual(1);
        });
      });

      it("produces a sequence of 'fortlaufende' numbers strictly incrementing by one", () => {
        withScope((scope) => {
          const nextFortlaufendeNummer =
            createFortlaufendeNummerGenerator(scope);
          let fortlaufendeNummer = nextFortlaufendeNummer("Anspruch");

          repeat(100, () => {
            const followingFortlaufendeNummer =
              nextFortlaufendeNummer("Anspruch");
            expect(followingFortlaufendeNummer).toStrictEqual(
              fortlaufendeNummer + 1,
            );
            fortlaufendeNummer = followingFortlaufendeNummer;
          });
        });
      });

      it("produces unique identifier for a meaningful sequence length", () => {
        withScope((scope) => {
          const nextFortlaufendeNummer =
            createFortlaufendeNummerGenerator(scope);
          const generatedFortlaufendeNummern = new Set<number>();

          repeat(100, () => {
            const fortlaufendeNummer = nextFortlaufendeNummer("Anspruch");
            expect(generatedFortlaufendeNummern.has(fortlaufendeNummer)).toBe(
              false,
            );
            generatedFortlaufendeNummern.add(fortlaufendeNummer);
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
