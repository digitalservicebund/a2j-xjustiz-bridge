import { type Herstellerinformation } from "~/xjustiz-schemata/grunddatensatz/composites";

/**
 * Constructs the static {@link Herstellerinformationen} with the version of the
 * XJustiz-Bridge in use.
 */
export function herstellerinformation(): Herstellerinformation {
  return {
    nameDesProdukts: "Justizportal XJustiz Services",
    herstellerDesProdukts:
      "Bundesministerium der Justiz und für Verbraucherschutz, ausgeführt durch DigitalService GmbH des Bundes",
    version: import.meta.env.PACKAGE_VERSION,
  };
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("nachrichtenkopf ergonomics", async () => {
    const { datatypeC } = await import(
      "~/xjustiz-schemata/din-91379/datatypeC"
    );
    const { datatypeD } = await import(
      "~/xjustiz-schemata/din-91379/datatypeD"
    );

    it("has the Herstellerinformationen with correct DIN 91379 types", () => {
      const { nameDesProdukts, herstellerDesProdukts, version } =
        herstellerinformation();

      expect(datatypeD(nameDesProdukts)).toStrictEqual({
        value: nameDesProdukts,
      });
      expect(datatypeD(herstellerDesProdukts)).toStrictEqual({
        value: herstellerDesProdukts,
      });
      expect(datatypeC(version)).toStrictEqual({ value: version });
    });
  });
}
