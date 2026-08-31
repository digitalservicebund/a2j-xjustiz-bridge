import {
  type Reference,
  reference,
} from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type Decimal } from "~/xjustiz-schemata/xml-schema-definition/decimal";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
import { type ZinsanspruchFuerZahlungsklage } from "~/nachricht/zahlungsklage/message-profile";
import { Zinsmethode } from "~/xjustiz-schemata/grunddatensatz/codelisten";

/**
 * Constructs a Zinsanspruch that references an Anspruch.
 *
 * XJustiz-Tools currently rejects populated `zinsanspruch` arrays. This
 * constructor is available to prepare for future tool support; use it only
 * when the receiving tool supports the resulting message.
 *
 * @example
 * ```typescript
 * const antrag = zinsanspruch(
 *   fortlaufendeNummerAnspruch,
 *   decimal(5).value,
 *   Temporal.PlainDate.from("2026-01-01"),
 * );
 * ```
 */
export function zinsanspruch<NachrichtenScope, Ordinal extends number>(
  fortlaufendeNummerAnspruch: FortlaufendeNummer<
    NachrichtenScope,
    "Anspruch",
    Ordinal
  >,
  zinssatz: Decimal,
  zinsbeginn: Readonly<Temporal.PlainDate>,
): {
  refFortlaufendeNummer: Reference<
    FortlaufendeNummer<NachrichtenScope, "Anspruch", Ordinal>
  >;
  zinsen: ZinsanspruchFuerZahlungsklage<NachrichtenScope>["zinsen"];
} {
  return {
    refFortlaufendeNummer: reference(fortlaufendeNummerAnspruch),
    zinsen: [
      {
        zinssatz,
        zinsmethode: Zinsmethode.JaehrlicherZinssatzUeberBasiszins,
        zinsbeginn,
      },
    ],
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  describe("Zinsanspruch", async () => {
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );
    const { decimal } = await import(
      "~/xjustiz-schemata/xml-schema-definition/decimal"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    it("references an Anspruch and wraps its Zinsen", () => {
      withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
        const fortlaufendeNummerAnspruch =
          createFortlaufendeNummerGenerator(scope).first("Anspruch");

        const result = zinsanspruch(
          fortlaufendeNummerAnspruch,
          decimal(5).value,
          Temporal.PlainDate.from("2026-01-01"),
        );

        expect(result).toEqual({
          refFortlaufendeNummer: fortlaufendeNummerAnspruch,
          zinsen: [
            {
              zinssatz: 5,
              zinsmethode: Zinsmethode.JaehrlicherZinssatzUeberBasiszins,
              zinsbeginn: Temporal.PlainDate.from("2026-01-01"),
            },
          ],
        });
        expectTypeOf(result).toExtend<
          ZinsanspruchFuerZahlungsklage<NachrichtenScope>
        >();
        expectTypeOf(result.refFortlaufendeNummer).toEqualTypeOf(
          reference(fortlaufendeNummerAnspruch),
        );
      });
    });
  });
}
