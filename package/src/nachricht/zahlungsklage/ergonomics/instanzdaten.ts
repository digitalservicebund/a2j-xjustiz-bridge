import {
  type NachrichtenkopfFuerZahlungsklage, // oxlint-disable-line no-unused-vars -- referenced by TSDoc
  type Zahlungsklage, // oxlint-disable-line no-unused-vars -- referenced by TSDoc
} from "~/nachricht/zahlungsklage/message-profile";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatype-c";
import { type Gerichte } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Instanzdaten } from "~/xjustiz-schemata/grunddatensatz/composites";

/**
 * Constructs some {@link Instanzdaten}, using the `gericht` as Instanzbehörde
 * and a plain Verfahrensgegenstand. The `gericht` for a new {@link Zahlungsklage}
 * is expected to match the Empfänger used in the {@link NachrichtenkopfFuerZahlungsklage}.
 */
export function instanzdaten(
  gericht: Gerichte,
  verfahrensgegenstand: DatatypeC,
): Instanzdaten {
  return {
    auswahlInstanzbehoerde: { gericht },
    verfahrensgegenstand: [{ gegenstand: verfahrensgegenstand }],
  };
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("Instanzdaten ergonomics", async () => {
    const { datatypeC } = await import(
      "~/xjustiz-schemata/din-91379/datatype-c"
    );
    const { Gerichte } = await import(
      "~/xjustiz-schemata/grunddatensatz/codelisten"
    );

    it("constructs a simple instance with Gericht as Behörde and a Verfahrensgegenstand", () => {
      const output = instanzdaten(
        Gerichte["ZZ Test-Bund"],
        datatypeC("Zahlungsklage").value,
      );

      expect(output).toStrictEqual({
        auswahlInstanzbehoerde: { gericht: Gerichte["ZZ Test-Bund"] },
        verfahrensgegenstand: [
          { gegenstand: datatypeC("Zahlungsklage").value },
        ],
      });
    });
  });
}
