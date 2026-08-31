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
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type Geldbetrag } from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";

/**
 * Options for constructing an {@link AntragAufAnwaltskosten}.
 */
export interface AntragAufAnwaltskostenOptions<
  NachrichtenScope,
  FortlaufendeNummerOrdinal extends number,
  KlaegerOrdinal extends number,
  BeklagterOrdinal extends number,
> {
  readonly fortlaufendeNummer: FortlaufendeNummer<
    NachrichtenScope,
    "Anspruch",
    FortlaufendeNummerOrdinal
  >;
  readonly klaeger: Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Klaeger,
    KlaegerOrdinal
  >;
  readonly beklagter: Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Beklagter,
    BeklagterOrdinal
  >;
  readonly wertAnspruch: Geldbetrag;
  readonly text: DatatypeE;
}

/**
 * The precise internal claim structure generated for an Anwaltskostenanspruch.
 */
export type AnwaltskostenAnspruch<
  NachrichtenScope,
  FortlaufendeNummerOrdinal extends number,
  KlaegerOrdinal extends number,
  BeklagterOrdinal extends number,
> = {
  fortlaufendeNummer: FortlaufendeNummer<
    NachrichtenScope,
    "Anspruch",
    FortlaufendeNummerOrdinal
  >;
  anspruchssteller: [
    {
      refRollennummer: Reference<
        Rollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Klaeger,
          KlaegerOrdinal
        >
      >;
    },
  ];
  anspruchsgegner: [
    {
      refRollennummer: Reference<
        Rollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Beklagter,
          BeklagterOrdinal
        >
      >;
    },
  ];
  anspruchsart: typeof Anspruchsart.Zahlung;
  wertAnspruch: Geldbetrag;
};

/**
 * Return type for {@link antragAufAnwaltskosten} preserving exact claim and role ordinals.
 */
export type AntragAufAnwaltskostenErgebnis<
  NachrichtenScope,
  FortlaufendeNummerOrdinal extends number,
  KlaegerOrdinal extends number,
  BeklagterOrdinal extends number,
> = AntragAufAnwaltskosten<NachrichtenScope> & {
  antragSonstige: {
    anspruch: [
      AnwaltskostenAnspruch<
        NachrichtenScope,
        FortlaufendeNummerOrdinal,
        KlaegerOrdinal,
        BeklagterOrdinal
      >,
    ];
  };
};

/**
 * Constructs an {@link AntragAufAnwaltskosten} for an Anwaltskostenanspruch.
 *
 * Encapsulates the nested claim structure, role references, and claim type.
 *
 *
 * @example
 * ```typescript
 * const antrag = antragAufAnwaltskosten({
 *   text: datatypeE("Außergerichtliche Anwaltskosten").value,
 *   fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
 *   klaeger: rollennummerKlaeger,
 *   beklagter: rollennummerBeklagter,
 *   wertAnspruch: geldbetrag(850.9),
 * });
 * ```
 */
export function antragAufAnwaltskosten<
  NachrichtenScope,
  FortlaufendeNummerOrdinal extends number,
  KlaegerOrdinal extends number,
  BeklagterOrdinal extends number,
>(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types
  options: Readonly<
    AntragAufAnwaltskostenOptions<
      NachrichtenScope,
      FortlaufendeNummerOrdinal,
      KlaegerOrdinal,
      BeklagterOrdinal
    >
  >,
): AntragAufAnwaltskostenErgebnis<
  NachrichtenScope,
  FortlaufendeNummerOrdinal,
  KlaegerOrdinal,
  BeklagterOrdinal
> {
  return {
    antragSonstige: {
      auswahlAntragSonstige: {
        sonstigerAntragTextform: options.text,
      },
      anspruch: [
        {
          fortlaufendeNummer: options.fortlaufendeNummer,
          anspruchssteller: [{ refRollennummer: reference(options.klaeger) }],
          anspruchsgegner: [{ refRollennummer: reference(options.beklagter) }],
          anspruchsart: Anspruchsart.Zahlung,
          wertAnspruch: options.wertAnspruch,
        },
      ],
    },
  };
}

/**
 * Constructs an {@link AntragAufVersaeumnisurteil}.
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
 * Constructs a free-form {@link DatatypeE} containing the text of the `Weitere Antraege`.
 */
export function weitererAntrag(
  sonstigerAntragTextform: DatatypeE,
): WeitererAntrag {
  return {
    antragSonstige: {
      auswahlAntragSonstige: {
        sonstigerAntragTextform,
      },
    },
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("sonstige Antraege", async () => {
    const { geldbetrag } = await import("~/ergonomics/geldbetrag");
    const { datatypeE: createDatatypeE } = await import(
      "~/xjustiz-schemata/din-91379/datatypeE"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );
    const { Rollenbezeichnung } = await import(
      "~/xjustiz-schemata/grunddatensatz/codelisten"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );

    it("creates an Antrag auf Anwaltskosten with required text", () => {
      withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerKlaeger = rollennummer.first(
          Rollenbezeichnung.Klaeger,
        );
        const rollennummerBeklagter = rollennummer.next(
          rollennummerKlaeger,
          Rollenbezeichnung.Beklagter,
        );
        const fortlaufendeNummerAnwaltskosten =
          createFortlaufendeNummerGenerator(scope).first("Anspruch");

        const result = antragAufAnwaltskosten({
          text: createDatatypeE("Anwaltskosten").value,
          fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
          klaeger: rollennummerKlaeger,
          beklagter: rollennummerBeklagter,
          wertAnspruch: geldbetrag(850.9),
        });

        expect(result).toEqual({
          antragSonstige: {
            auswahlAntragSonstige: {
              sonstigerAntragTextform: "Anwaltskosten",
            },
            anspruch: [
              {
                fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
                anspruchssteller: [{ refRollennummer: rollennummerKlaeger }],
                anspruchsgegner: [{ refRollennummer: rollennummerBeklagter }],
                anspruchsart: { code: "001" },
                wertAnspruch: geldbetrag(850.9),
              },
            ],
          },
        });
        expectTypeOf(result).toExtend<
          AntragAufAnwaltskosten<NachrichtenScope>
        >();
      });
    });

    it("creates an Antrag auf Anwaltskosten with custom text", () => {
      withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
        const rollennummer = createRollennummerGenerator(scope);
        const rollennummerKlaeger = rollennummer.first(
          Rollenbezeichnung.Klaeger,
        );
        const rollennummerBeklagter = rollennummer.next(
          rollennummerKlaeger,
          Rollenbezeichnung.Beklagter,
        );
        const fortlaufendeNummerAnwaltskosten =
          createFortlaufendeNummerGenerator(scope).first("Anspruch");

        const result = antragAufAnwaltskosten({
          text: createDatatypeE("Außergerichtliche Anwaltskosten").value,
          fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
          klaeger: rollennummerKlaeger,
          beklagter: rollennummerBeklagter,
          wertAnspruch: geldbetrag(850.9),
        });

        expect(result).toEqual({
          antragSonstige: {
            auswahlAntragSonstige: {
              sonstigerAntragTextform: "Außergerichtliche Anwaltskosten",
            },
            anspruch: [
              {
                fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
                anspruchssteller: [{ refRollennummer: rollennummerKlaeger }],
                anspruchsgegner: [{ refRollennummer: rollennummerBeklagter }],
                anspruchsart: { code: "001" },
                wertAnspruch: geldbetrag(850.9),
              },
            ],
          },
        });
        expectTypeOf(result).toExtend<
          AntragAufAnwaltskosten<NachrichtenScope>
        >();
      });
    });

    it("preserves scope, role, and ordinal constraints", () => {
      withScope(<FirstScope>(firstScope: ScopeToken<FirstScope>) => {
        const firstRollennummer = createRollennummerGenerator(firstScope);
        const firstKlaeger = firstRollennummer.first(Rollenbezeichnung.Klaeger);
        const firstBeklagter = firstRollennummer.next(
          firstKlaeger,
          Rollenbezeichnung.Beklagter,
        );
        const firstFortlaufendeNummer =
          createFortlaufendeNummerGenerator(firstScope).first("Anspruch");
        const options = {
          text: createDatatypeE("Anwaltskosten").value,
          fortlaufendeNummer: firstFortlaufendeNummer,
          klaeger: firstKlaeger,
          beklagter: firstBeklagter,
          wertAnspruch: geldbetrag(850.9),
        };

        withScope(<SecondScope>(_secondScope: ScopeToken<SecondScope>) => {
          // @ts-expect-error -- identifiers from different scopes cannot mix
          antragAufAnwaltskosten<SecondScope, 0, 0, 1>(options);
        });

        const optionsWithWrongRole: AntragAufAnwaltskostenOptions<
          FirstScope,
          0,
          0,
          1
        > = {
          ...options,
          // @ts-expect-error -- plaintiff and defendant roles are distinct
          klaeger: firstBeklagter,
        };
        antragAufAnwaltskosten<FirstScope, 0, 0, 1>(optionsWithWrongRole);

        // @ts-expect-error -- the ordinal is part of the identifier contract
        antragAufAnwaltskosten<FirstScope, 1, 0, 1>(options);
      });
    });

    it("creates an Antrag auf Versaeumnisurteil", () => {
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

    it("creates einen weiteren Antrag", () => {
      const result = weitererAntrag(
        createDatatypeE("Weitere Antraege ...").value,
      );

      expect(result).toEqual({
        antragSonstige: {
          auswahlAntragSonstige: {
            sonstigerAntragTextform: "Weitere Antraege ...",
          },
        },
      });
      expectTypeOf(result).toEqualTypeOf<WeitererAntrag>();
    });
  });
}
