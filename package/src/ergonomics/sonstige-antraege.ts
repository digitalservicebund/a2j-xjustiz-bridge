import {
  Anspruchsart,
  AntragCodeliste,
} from "~/xjustiz-schemata/klaver/codelisten";
import {
  type AntragAufAnwaltskosten,
  type AntragAufVersaeumnisurteil,
  type WeitererAntrag,
} from "~/nachricht/zahlungsklage/message-profile";
import {
  type Reference,
  reference,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type DeepReadonly } from "~/metatypes";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type Geldbetrag } from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";

/**
 * Constructs an {@link AntragAufAnwaltskosten}, encapsulates the nested claim
 * structure, role references, and claim type.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // Define the relevant Beteiligungen.
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerDesKlaeger = rollennummer.first(Rollenbezeichnung.Klaeger);
 *   const rollennummerDesBeklagten = rollennummer.first(Rollenbezeichnung.Beklagter);
 *   // ...
 *
 *   const fortlaufendeNummer = createFortlaufendeNummerGenerator(scope);
 *   const fortlaufendeNummerForAnwaltskosten = fortlaufendeNummerForAnwaltskosten.first("Anspruch")
 *
 *   const antrag = antragAufAnwaltskosten(
 *     fortlaufendeNummerForAnwaltskosten,
 *     rollennummerDesKlaegers,
 *     rollennummerDesBeklagten,
 *     geldbetrag(850.9),
 *     datatypeE("Außergerichtliche Anwaltskosten").value,
 *   );
 *
 *   // Use Beteiligungen and Antrag in the message ...
 * });
 * ```
 */
export function antragAufAnwaltskosten<
  NachrichtenScope,
  const Nummer extends FortlaufendeNummer<NachrichtenScope, "Anspruch">,
  const RollennummerDesKlaegers extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Klaeger
  >,
  const RollennummerDesBeklagten extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Beklagter
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  fortlaufendeNummer: Nummer,
  klaeger: RollennummerDesKlaegers,
  beklagter: RollennummerDesBeklagten,
  kosten: DeepReadonly<Geldbetrag>,
  antragInTextform: DatatypeE,
) {
  return {
    antragSonstige: {
      auswahlAntragSonstige: {
        sonstigerAntragTextform: antragInTextform,
      },
      anspruch: [
        {
          fortlaufendeNummer,
          anspruchssteller: [{ refRollennummer: reference(klaeger) }],
          anspruchsgegner: [{ refRollennummer: reference(beklagter) }],
          anspruchsart: Anspruchsart.Zahlung,
          wertAnspruch: kosten,
        },
      ],
    },
  } satisfies AntragAufAnwaltskosten<NachrichtenScope>;
}

/**
 * Constructs a standard {@link AntragAufVersaeumnisurteil}.
 */
export function antragAufVersaeumnisurteil(): AntragAufVersaeumnisurteil {
  return {
    antragSonstige: {
      auswahlAntragSonstige: {
        antragWerteliste: AntragCodeliste.AntragAufVersaeumnisurteil,
      },
    },
  };
}

/**
 * Constructs a "free-form" Antrag with plain text.
 */
export function weitererAntrag(antragInTextform: DatatypeE): WeitererAntrag {
  return {
    antragSonstige: {
      auswahlAntragSonstige: {
        sonstigerAntragTextform: antragInTextform,
      },
    },
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("ergonomics for sonstige Antraege", async () => {
    const { geldbetrag } = await import("~/ergonomics/geldbetrag");
    const { datatypeE } = await import(
      "~/xjustiz-schemata/din-91379/datatypeE"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );
    const { Rollenbezeichnung, Waehrung } = await import(
      "~/xjustiz-schemata/grunddatensatz/codelisten"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );

    // oxlint-disable-next-line max-lines-per-function
    it("constructs a correctly structured Antrag for Anwaltskosten with literal type result", () => {
      // oxlint-disable-next-line max-lines-per-function
      withScope((scope) => {
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerDesKlaegers = rollennummer.first(
          Rollenbezeichnung.Klaeger,
        );
        const rollennummerDesBeklagten = rollennummer.next(
          rollennummerDesKlaegers,
          Rollenbezeichnung.Beklagter,
        );
        const fortlaufendeNummerForAnwaltskosten =
          createFortlaufendeNummerGenerator(scope).first("Anspruch");

        const antrag = antragAufAnwaltskosten(
          scope,
          fortlaufendeNummerForAnwaltskosten,
          rollennummerDesKlaegers,
          rollennummerDesBeklagten,
          geldbetrag(850.9),
          datatypeE("Außergewöhnliche Anwaltskosten").value,
        );

        expect(antrag).toStrictEqual({
          antragSonstige: {
            auswahlAntragSonstige: {
              sonstigerAntragTextform: "Außergewöhnliche Anwaltskosten",
            },
            anspruch: [
              {
                fortlaufendeNummer: fortlaufendeNummerForAnwaltskosten,
                anspruchssteller: [
                  { refRollennummer: rollennummerDesKlaegers },
                ],
                anspruchsgegner: [
                  { refRollennummer: rollennummerDesBeklagten },
                ],
                anspruchsart: Anspruchsart.Zahlung,
                wertAnspruch: geldbetrag(850.9),
              },
            ],
          },
        });

        expectTypeOf(antrag).toEqualTypeOf<{
          antragSonstige: {
            auswahlAntragSonstige: {
              sonstigerAntragTextform: DatatypeE;
            };
            anspruch: [
              {
                fortlaufendeNummer: typeof fortlaufendeNummerForAnwaltskosten;
                anspruchssteller: [
                  {
                    refRollennummer: Reference<typeof rollennummerDesKlaegers>;
                  },
                ];
                anspruchsgegner: [
                  {
                    refRollennummer: Reference<typeof rollennummerDesBeklagten>;
                  },
                ];
                anspruchsart: typeof Anspruchsart.Zahlung;
                wertAnspruch: {
                  readonly zahl: number;
                  readonly auswahlWaehrung: {
                    readonly waehrung: typeof Waehrung.Euro;
                  };
                };
              },
            ];
          };
        }>();
      });
    });

    it("constructs a correctly structured Antrag auf Versaeumnisurteil", () => {
      const result = antragAufVersaeumnisurteil();

      expect(result).toEqual({
        antragSonstige: {
          auswahlAntragSonstige: {
            antragWerteliste: { code: "001" },
          },
        },
      });
      expectTypeOf(result).toEqualTypeOf<AntragAufVersaeumnisurteil>();
    });

    it("constructs a correctly structured weiteren Antrag", () => {
      const antrag = weitererAntrag(datatypeE("Lorem ipsum").value);

      expect(antrag).toEqual({
        antragSonstige: {
          auswahlAntragSonstige: {
            sonstigerAntragTextform: "Lorem ipsum",
          },
        },
      });

      expectTypeOf(antrag).toEqualTypeOf<WeitererAntrag>();
    });
  });
}
