/**
 * **ATTENTION:**
 * This is only meant to find invalid characters, knowing the input isn't valid
 * as whole. The used algorithm isn't performant enough to be used for fast
 * parsing.
 *
 * This function interprets characters as linguistic graphemes. The given regular
 * expression for the `allowedCharacters` **MUST** be so defined that is works
 * when applied to a single grapheme, as it will be evaluated per segmented
 * grapheme. All patterns by the **DIN 91379 datatypes** suit these
 * requirements.
 *
 * **WARNING:**
 * Make sure to match Unicode formats between the input and the regular
 * expression. That means, if the regular expression is defined using the
 * composed or decomposed Unicode format, the input string must also match that.
 * This can be done using the {@link String.prototype.normalize} function with
 * the respectively matching format as argument.
 */
export function findInvalidCharacters(
  input: string,
  allowedCharacters: Readonly<RegExp>,
): Set<string> {
  return new Set(
    segmentUnicodeIntoLinguisticGraphemes(input).filter(
      (grapheme) => !allowedCharacters.test(grapheme),
    ),
  );
}

/**
 * Improved version of {@link Intl.Segmenter.prototype.segment} to properly
 * address binary diacritic clustering.
 *
 * The function can be used to work with the graphemes ("characters") in
 * a linguistic way. This is for example critical when working with regular
 * expressions on the unit of a grapheme (read: test by character, not full
 * string) where binary diacritics play a role (e.g. for DIN 91379).
 *
 * There are unary and binary diacritics. Unary ones combine with a single
 * preceding base letter into a grapheme (e.g. "À" or "ç"). Multiple unary
 * diacritics can also be merged to a shared base letter into a single grapheme
 * (e.g. "R̥̄" or "L̥̄"). Binary diacritics apply to two base letters on their left
 * and right as a single grapheme (e.g. "K͟H" or "T͡s").
 * Unicode treats binary diacritics as unary ones, splitting an actual linguistic
 * grapheme of a single phoneme unit into two clusters. For example, the grapheme
 * "K͟H" (`'\u004B\u035F\u0048'`) becomes "wrongly" split into two clusters of "K͟"
 * and "H" (`['\u004B\u035F', '\u0048']`).
 */
function segmentUnicodeIntoLinguisticGraphemes(text: string): string[] {
  const unicodeGraphemeClusters = Array.from(
    new globalThis.Intl.Segmenter(UNDETERMINED_LOCALE, {
      granularity: "grapheme",
    }).segment(text),
    (segment: Readonly<Intl.SegmentData>) => segment.segment,
  );

  const linguisticGraphemes: string[] = [];

  for (let index = 0; index < unicodeGraphemeClusters.length; index++) {
    let grapheme = unicodeGraphemeClusters[index];

    // TypeScript can't check the loop index.
    if (grapheme !== undefined) {
      const endsWithBinaryDiacritic = BINARY_DIACRITICS.test(grapheme);

      if (endsWithBinaryDiacritic) {
        const nextCluster = unicodeGraphemeClusters[++index];
        grapheme += nextCluster ?? "";
      }

      linguisticGraphemes.push(grapheme);
    }
  }

  return linguisticGraphemes;
}

/**
 * Language tag for "undefined language" by IETF BCP 47 (Internet Engineering Task Force Best Current Practice).
 * Used to explicitly avoid any implicit locale determination from runtime environment.
 */
const UNDETERMINED_LOCALE = "und" as const;

const BINARY_DIACRITICS = /[\u035C-\u0362\u1DFC]$/u;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("Unicode", () => {
    describe("segment Unicode into linguistic graphemes", () => {
      it("segments single letters and symbols in distinct graphemes", () => {
        expect(
          segmentUnicodeIntoLinguisticGraphemes("abcDEF!? "),
        ).toStrictEqual(["a", "b", "c", "D", "E", "F", "!", "?", " "]);
      });

      it("segments unary diacritics with their base letter into one grapheme in composed format", () => {
        expect(
          segmentUnicodeIntoLinguisticGraphemes("Àb\u0300ç\u004C\u0325\u0304"),
        ).toStrictEqual(["À", "b̀", "ç", "L̥̄"]);
      });

      it("segments binary diacritics with both letters into one grapheme in composed format", () => {
        expect(
          segmentUnicodeIntoLinguisticGraphemes("K͟H\u0054\u0361\u0073T\u035Fh"),
        ).toStrictEqual(["K͟H", "T͡s", "T͟h"]);
      });
    });
  });
}
