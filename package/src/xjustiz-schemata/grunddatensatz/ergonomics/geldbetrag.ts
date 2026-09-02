import { type Double } from "~/xjustiz-schemata/xml-schema-definition/scalars";
import { type Geldbetrag } from "~/xjustiz-schemata/grunddatensatz/composites";
import { Waehrung } from "~/xjustiz-schemata/grunddatensatz/codelisten";

/**
 * Constructs a {@link Geldbetrag} from an amount in Euro.
 *
 * @example
 * ```typescript
 * const betrag = geldbetrag(5_000);
 * ```
 */

export function geldbetrag(zahl: Double): Geldbetrag {
  return {
    zahl,
    auswahlWaehrung: {
      waehrung: Waehrung.Euro,
    },
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  describe("geldbetrag", () => {
    it("creates a valid Geldbetrag with Euro as the default currency", () => {
      const betrag = geldbetrag(5000);

      expect(betrag).toEqual({
        zahl: 5000,
        auswahlWaehrung: { waehrung: Waehrung.Euro },
      });
    });

    it("has the exact type expected by the domain Geldbetrag", () => {
      const betrag = geldbetrag(5000);

      expectTypeOf(betrag).toEqualTypeOf<Geldbetrag>();
    });
  });
}
