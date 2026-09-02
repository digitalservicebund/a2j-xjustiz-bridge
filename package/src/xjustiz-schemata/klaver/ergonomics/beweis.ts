import {
  type Reference,
  reference,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type Beweis } from "~/xjustiz-schemata/klaver/composites";
import { type BeweisNummer } from "~/xjustiz-schemata/klaver/beweis-nummer";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";

/**
 * Constructs a {@link Beweis} with Zeugen as Beweismittel. The referenced
 * Beteiligung which acts as Zeuge must have {@link Rollenbezeichnung.Zeuge} as
 * one of their roles.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // Define the Beteiligung which acts as Zeuge.
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerDesZeugen = rollennummer.first(Rollenbezeichnung.Zeuge);
 *   // ...
 *
 *   const beweisNummer = createBeweisNummerGenerator(scope);
 *   const beweisNummerForZeuge = beweisNummer.first();
 *   const zeugeAsBeweis = zeuge(scope, beweisNummerForZeuge, rollennummerDesZeugen);
 *
 *   // Use Beteiligung and Beweis in the message ...
 * })
 * ```
 */
export function zeuge<
  NachrichtenScope,
  const Nummer extends BeweisNummer<NachrichtenScope>,
  const RollennummerDesZeugen extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Zeuge
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  beweisNummer: Nummer,
  rollennummerDesZeugen: RollennummerDesZeugen,
) {
  return {
    beweisNummer,
    auswahlBeweismittel: {
      zeugen: { refRollennummer: reference(rollennummerDesZeugen) },
    },
  } satisfies Beweis<NachrichtenScope>;
}

/**
 * Constructs a {@link Beweis} with a Parteivernehmung as Beweismittel. The
 * referenced Beteiligung of the Partei to be interrogated must have at
 * least one of the matching roles.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // Define the Beteiligung of the Partei to be interrogated.
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerDesKlaegers = rollennummer.first(Rollenbezeichnung.Klaeger);
 *   // ...
 *
 *   const beweisNummer = createBeweisNummerGenerator(scope);
 *   const beweisNummerForParteivernehmung = beweisNummer.first();
 *   const parteivernehmungAsBeweis = parteivernehmung(
 *     scope,
 *     beweisNummerForParteivernehmung,
 *     rollennummerDesKlaegers,
 *   );
 *
 *   // Use Beteiligung and Beweis in the message ...
 * })
 * ```
 */
export function parteivernehmung<
  NachrichtenScope,
  const Nummer extends BeweisNummer<NachrichtenScope>,
  const RollennummerDerPartei extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Klaeger | typeof Rollenbezeichnung.Beklagter
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  beweisNummer: Nummer,
  rollennummerDerPartei: RollennummerDerPartei,
) {
  return {
    beweisNummer,
    auswahlBeweismittel: {
      parteivernehmung: { refRollennummer: reference(rollennummerDerPartei) },
    },
  } satisfies Beweis<NachrichtenScope>;
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("ergonomics for Beweise", async () => {
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );
    const { Rollenbezeichnung } = await import(
      "~/xjustiz-schemata/grunddatensatz/codelisten"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const { createBeweisNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/beweis-nummer"
    );

    it("constructs a correctly structured Zeuge as Beweis with literal type result", () => {
      withScope((scope) => {
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerDesZeugen = rollennummer.first(
          Rollenbezeichnung.Zeuge,
        );
        const beweisNummer = createBeweisNummerGenerator(scope);
        const beweisNummerForZeuge = beweisNummer.first();
        const zeugeAsBeweis = zeuge(
          scope,
          beweisNummerForZeuge,
          rollennummerDesZeugen,
        );

        expect(zeugeAsBeweis).toStrictEqual({
          beweisNummer: beweisNummerForZeuge,
          auswahlBeweismittel: {
            zeugen: { refRollennummer: reference(rollennummerDesZeugen) },
          },
        });

        expectTypeOf(zeugeAsBeweis).toEqualTypeOf<{
          beweisNummer: typeof beweisNummerForZeuge;
          auswahlBeweismittel: {
            zeugen: {
              refRollennummer: Reference<typeof rollennummerDesZeugen>;
            };
          };
        }>();
      });
    });

    it("constructs a correctly structured Parteivernehmung as Beweis with literal type result", () => {
      withScope((scope) => {
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerDesKlaegers = rollennummer.first(
          Rollenbezeichnung.Klaeger,
        );
        const beweisNummer = createBeweisNummerGenerator(scope);
        const beweisNummerForParteivernehmung = beweisNummer.first();
        const parteivernehmungAsBeweis = parteivernehmung(
          scope,
          beweisNummerForParteivernehmung,
          rollennummerDesKlaegers,
        );

        expect(parteivernehmungAsBeweis).toStrictEqual({
          beweisNummer: beweisNummerForParteivernehmung,
          auswahlBeweismittel: {
            parteivernehmung: {
              refRollennummer: rollennummerDesKlaegers,
            },
          },
        });

        expectTypeOf(parteivernehmungAsBeweis).toEqualTypeOf<{
          beweisNummer: typeof beweisNummerForParteivernehmung;
          auswahlBeweismittel: {
            parteivernehmung: {
              refRollennummer: Reference<typeof rollennummerDesKlaegers>;
            };
          };
        }>();
      });
    });
  });
}
