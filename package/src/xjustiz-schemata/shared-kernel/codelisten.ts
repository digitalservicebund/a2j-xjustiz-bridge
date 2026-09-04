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

type Codelisteneintraege = Record<string, string>;

type Codeliste<Eintraege extends Codelisteneintraege> = {
  readonly [Name in keyof Eintraege]: Eintraege[Name] extends infer Code
    ? Codelisteneintrag<Name & string, Code & string>
    : never;
};

export type IsCodeliste<MaybeCodeliste> = [MaybeCodeliste] extends [
  Codelisteneintrag<string, string>,
]
  ? [keyof MaybeCodeliste] extends [keyof Codelisteneintrag<string, string>]
    ? true
    : false
  : false;

/**
 * Prettifies the display of Codelisteinträge, conserving the name to improve
 * comprehensibility.
 *
 * Background:
 * Under the hood, only raw codes are included in a message. Thereby,
 * a the runtime value of Codelisteneintrag by itself is just the code wrapped
 * in an object. While XJustiz messages themselves are not meant to be read by
 * humans, composing a message as developer still demands readability. A random
 * type instance of `{ code: "108" }` looks confusing and lacks details to act.
 * The interface hides the runtime presentation and preserves the name of the
 * Codelisteneintrag.
 */
export interface Codelisteneintrag<_Name extends string, Code extends string> {
  readonly code: Code;
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
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
        | Codelisteneintrag<"Maennlich", "1">
        | Codelisteneintrag<"Weiblich", "2">
        | Codelisteneintrag<"Divers", "3">
      >();
    });

    // oxlint-disable-next-line max-lines-per-function
    describe("is Codeliste", () => {
      it("is true for a Codeliste with single Codelisteneintrag", () => {
        expectTypeOf<
          IsCodeliste<Codelisteneintrag<"foo", "0">>
        >().toEqualTypeOf<true>();
      });

      it("is true for a Codeliste with multiple Codelisteneinträge", () => {
        expectTypeOf<
          IsCodeliste<
            | Codelisteneintrag<"foo", "0">
            | Codelisteneintrag<"bar", "1">
            | Codelisteneintrag<"baz", "2">
          >
        >().toEqualTypeOf<true>();
      });

      it("is true for a Codeliste in plain object shape", () => {
        expectTypeOf<
          IsCodeliste<{ code: "0" } | { code: "1" }>
        >().toEqualTypeOf<true>();
      });

      it("is false for an intersected Codeliste", () => {
        expectTypeOf<
          IsCodeliste<Codelisteneintrag<"foo", "0"> & { something: "else" }>
        >().toEqualTypeOf<false>();
      });

      it("is false for a Codelisten similar object shape with additional properties", () => {
        expectTypeOf<
          IsCodeliste<{ code: "0"; name: "foo" } | { code: "1"; name: "bar" }>
        >().toEqualTypeOf<false>();
      });

      it("is false for a union that doesn't include Codelisteneinträge only", () => {
        expectTypeOf<
          IsCodeliste<
            | Codelisteneintrag<"foo", "0">
            | { something: "else" }
            | Codelisteneintrag<"baz", "2">
          >
        >().toEqualTypeOf<false>();
      });

      it("is false for various other plain types", () => {
        expectTypeOf<IsCodeliste<string>>().toEqualTypeOf<false>();
        expectTypeOf<IsCodeliste<number>>().toEqualTypeOf<false>();
        expectTypeOf<IsCodeliste<boolean>>().toEqualTypeOf<false>();
        expectTypeOf<IsCodeliste<symbol>>().toEqualTypeOf<false>();
        expectTypeOf<IsCodeliste<object>>().toEqualTypeOf<false>();
        expectTypeOf<IsCodeliste<string[]>>().toEqualTypeOf<false>();
      });
    });
  });
}
