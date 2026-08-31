import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
import { type ZinsanspruchFuerZahlungsklage } from "~/nachricht/zahlungsklage/message-profile";

/**
 * Constructs Nebenantraege Zinsen without a Zinsanspruch.
 *
 * XJustiz-Tools currently accepts only this empty form. The overload with a
 * Zinsanspruch is available to prepare for future tool support.
 *
 * @example
 * ```typescript
 * const antrag = nebenantraegeZinsen(datatypeE("").value);
 * ```
 */
export function nebenantraegeZinsen(inhalt: DatatypeE): {
  inhalt: DatatypeE;
  zinsanspruch: [];
};
/**
 * Constructs Nebenantraege Zinsen with a composed Zinsanspruch.
 *
 * @example
 * ```typescript
 * const antrag = nebenantraegeZinsen(
 *   datatypeE("").value,
 *   zinsanspruch(
 *     fortlaufendeNummerAnspruch,
 *     decimal(5).value,
 *     Temporal.PlainDate.from("2026-01-01"),
 *   ),
 * );
 * ```
 */
export function nebenantraegeZinsen<const Zinsanspruch, NachrichtenScope>(
  inhalt: DatatypeE,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types
  anspruch: Zinsanspruch & ZinsanspruchFuerZahlungsklage<NachrichtenScope>,
): {
  inhalt: DatatypeE;
  zinsanspruch: [Zinsanspruch];
};

export function nebenantraegeZinsen(
  inhalt: DatatypeE,
  anspruch?: unknown,
): {
  inhalt: DatatypeE;
  zinsanspruch: unknown[];
} {
  return {
    inhalt,
    zinsanspruch: anspruch === undefined ? [] : [anspruch],
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  describe("Nebenantraege Zinsen", async () => {
    const { datatypeE } = await import(
      "~/xjustiz-schemata/din-91379/datatypeE"
    );
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );
    const { decimal } = await import(
      "~/xjustiz-schemata/xml-schema-definition/decimal"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );
    const { zinsanspruch } = await import("~/ergonomics/zinsanspruch");

    it("creates Nebenantraege with an empty Zinsanspruch array", () => {
      const result = nebenantraegeZinsen(datatypeE("Lorem ipsum").value);

      expect(result).toEqual({
        inhalt: "Lorem ipsum",
        zinsanspruch: [],
      });
      expectTypeOf(result.zinsanspruch).toEqualTypeOf<[]>();
    });

    it("creates Nebenantraege with a composed Zinsanspruch", () => {
      withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
        const fortlaufendeNummerAnspruch =
          createFortlaufendeNummerGenerator(scope).first("Anspruch");

        const anspruchItem = zinsanspruch(
          fortlaufendeNummerAnspruch,
          decimal(5).value,
          Temporal.PlainDate.from("2026-01-01"),
        );

        const result = nebenantraegeZinsen(datatypeE("").value, anspruchItem);

        expect(result).toEqual({
          inhalt: "",
          zinsanspruch: [anspruchItem],
        });
        expectTypeOf(result.zinsanspruch).toEqualTypeOf<
          [typeof anspruchItem]
        >();
      });
    });
  });
}
