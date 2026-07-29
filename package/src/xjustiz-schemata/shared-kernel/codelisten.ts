/**
 * Utility function to reduce boilerplate when defining a Codeliste.
 * Expects a mapping of Codelisteneinträge with their Name and Code.
 * Should be used together with {@link InferCodeliste} to get the
 * complementary type.
 *
 * See the [documentation of the pattern](../../../../documentation/patterns/codelisten.md)
 * for Codelisten for reasoning and further details. Practical examples can be
 * discovered by inspecting reference usages in the codebase.
 *
 * @example
 * ```typescript
 * const Geschlecht = defineCodeliste({
 *   Maennlich: "1",
 *   Weiblich: "2",
 *   Divers: "3",
 * });
 *
 * type Geschlecht = InferCodeliste<typeof Geschlecht>;
 *
 * // Is equivalent to:
 * const Geschlecht = {
 *   Maennlich: { code: "1" },
 *   Weiblich: { code: "2" },
 *   Divers: { code: "3" },
 * } as const;
 *
 * type Geschlecht = typeof Geschlecht[keyof typeof Geschlecht];
 * ```
 */
export function defineCodeliste<const Eintraege extends Codelisteneintraege>(
  eintraege: Eintraege,
): Codeliste<Eintraege> {
  // oxlint-disable-next-line no-unsafe-type-assertion
  return Object.fromEntries(
    Object.entries(eintraege).map(([name, code]) => [name, { code }]),
  ) as Codeliste<Eintraege>;
}

/**
 * Infer the type related to a Codeliste, usually created by
 * {@link defineCodeliste}. Results into the union of all codes.
 *
 * @example
 * ```typescript
 * const Geschlecht = defineCodeliste({
 *   Maennlich: "1",
 *   Weiblich: "2",
 *   Divers: "3",
 * });
 *
 * type Geschlecht = InferCodeliste<typeof Codeliste>;
 *
 * define function greet(geschlecht: Geschlecht): void;
 * greet(Geschlecht.Weiblich);
 * greet({ code: "3" });
 * ```
 */
export type InferCodeliste<Liste extends Codeliste<Codelisteneintraege>> =
  Liste[keyof Liste];

type Codeliste<Eintraege extends Record<string, Code>> = {
  readonly [Key in keyof Eintraege]: { readonly code: Eintraege[Key] };
};

type Codelisteneintraege = Record<Name, Code>;
type Name = string;
type Code = string;

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  describe("Codelisten", () => {
    it("wraps the Code of each Eintrag in an object", () => {
      const codeliste = defineCodeliste({
        Maennlich: "1",
        Weiblich: "2",
        Divers: "3",
      });

      expect(codeliste).toStrictEqual({
        Maennlich: { code: "1" },
        Weiblich: { code: "2" },
        Divers: { code: "3" },
      });
    });

    it("infers the Codelisten type as union of all the Einträge their Codes", () => {
      const codeliste = defineCodeliste({
        Maennlich: "1",
        Weiblich: "2",
        Divers: "3",
      });

      expectTypeOf<InferCodeliste<typeof codeliste>>().toEqualTypeOf<
        { readonly code: "1" } | { readonly code: "2" } | { readonly code: "3" }
      >();
    });
  });
}
