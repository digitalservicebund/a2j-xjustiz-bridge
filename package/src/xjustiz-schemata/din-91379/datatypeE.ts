// oxlint-disable max-lines -- tests take a lot of lines
import {
  type ConsumeCharactersFrom,
  type DeepLiteralToPrimitive,
} from "~/metatypes";
import {
  type FailureResult,
  type IsLiteral,
  type LiteralAwareResult,
  type RefinedTypeFactory, // oxlint-disable-line no-unused-vars -- referenced by TSDoc
  type Result,
  type SuccessResult,
  defineRefinedType,
  isString,
} from "~/xjustiz-schemata/shared-kernel/refined-types";
import {
  type GriechischeBuchstaben,
  type KyrillischeBuchstabenA3,
  type LateinischeBuchstabenIncomplete,
  type NichtBuchstabenE1,
  type NichtBuchstabenN1,
  type NichtBuchstabenN2,
  type NichtBuchstabenN3,
  type NichtBuchstabenN4,
} from "./schriftzeichengruppe";
import { type DatatypeA } from "./datatypeA";
import { type DatatypeB } from "./datatypeB";
import { type DatatypeC } from "./datatypeC";
import { type DatatypeD } from "./datatypeD";
import { findInvalidCharacters } from "./unicode";
import { transformXsdPatternToJavaScriptExpression } from "~/xjustiz-schemata/xml-schema-definition/restriction-pattern";

declare const TAG: unique symbol;

/**
 * Datatype E of the DIN 91379 norm. A string with restricted character set.
 *
 * This is an extension of {@link DatatypeC} and {@link DatatypeD}, making it
 * the most comprehensive datatype. It encompasses all normative and extended
 * characters defined by the DIN norm. It includes Latin, Greek, and Cyrillic
 * alphabets, as well as non-letters N1-N4 and E1. Notably, while Datatype D
 * excludes control characters and newlines (group N4), Datatype E includes them
 * (inherited from Datatype C).
 *
 * It is primarily intended for cross-border data exchange where foreign
 * writing systems like Cyrillic or Greek are necessary. Texts with characters
 * outside the DIN norm, such as Japanese or Arabic characters, are inadmissible.
 *
 * See the related {@link datatypeE | refined type factory} for construction.
 *
 * Available operations that maintain the type:
 *   - {@link join}
 */
export type DatatypeE = string & {
  readonly [TAG]: "Use the `datatypeE` factory to construct valid instances.";
};

function parseDatatypeE(
  issueMessages: DatatypeEIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  return function parse(input: string): Result<DatatypeE> {
    const composedUnicodeInput = input.normalize("NFC");

    if (DATATYPE_E_PATTERN.test(composedUnicodeInput)) {
      return { value: composedUnicodeInput as unknown as DatatypeE }; // oxlint-disable-line no-unsafe-type-assertion -- explicit cast "trick" for branding

      // oxlint-disable-next-line no-else-return -- false positive
    } else {
      const characters = findInvalidCharacters(
        composedUnicodeInput,
        DATATYPE_E_PATTERN,
      );

      return {
        issues: [{ message: issueMessages.invalidCharacters(characters) }],
      };
    }
  } as <Value extends string>(
    input: Value,
  ) => LiteralAwareResult<string, Value, ParseDatatypeE<Value>, DatatypeE>;
}

const DEFAULT_ISSUE_MESSAGES = {
  /**
   * @param characters - graphemes as phoneme units in composed Unicode format
   */
  invalidCharacters: (characters: Readonly<Set<string>>) =>
    `Contains characters not allowed by DIN 91379 Datentyp E: ${[...characters].map((character) => `'${character}'`).join(", ")}`,
} as const;

type DatatypeEIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParseDatatypeE<Value extends string> =
  IsLiteral<Value, string> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : ConsumeCharactersFrom<Value, DatatypeECharacterIncomplete> extends ""
      ? SuccessResult<DatatypeE>
      : Result<DatatypeE>;

type DatatypeECharacterIncomplete =
  | LateinischeBuchstabenIncomplete
  | NichtBuchstabenN1
  | NichtBuchstabenN2
  | NichtBuchstabenN3
  | NichtBuchstabenN4
  | GriechischeBuchstaben
  | KyrillischeBuchstabenA3
  | NichtBuchstabenE1;

/**
 * Factory function object for the {@link DatatypeE} refined type. See
 * {@link RefinedTypeFactory} for further details, usage examples and
 * customization.
 *
 * Support for partial compile-time parsing of static string literals. Only
 * a subset of the full character set that is tested at runtime is supported.
 * This includes the full ASCII range, Greek and Cyrillic letters, and all
 * extended non-letters groups. Primarily, multi code point Unicode sequences
 * are excluded. For static string literals with characters outside the
 * supported range, the result stays undetermined and compile-time evaluation
 * is necessary.
 *
 * @example
 * ```typescript
 * datatypeE("Невский 15\nΕταιρεία Α.Ε.").value; // success (compile-time parsing)
 * const someResult = datatypeE("محمد"); // undetermined (but fails at runtime)
 * const otherResult = datatypeE(someDynamicInput); // always undetermined
 * const mySchema = someSchemaLibrary({ globalName: datatypeE }); // via Standard Schema
 * ```
 */
export const datatypeE = defineRefinedType(isString, parseDatatypeE);

/**
 * Adapted version of the default {@link Array.prototype.join} operation that
 * maintains the invariants of {@link DatatypeE}. Also supports passing
 * and mixing {@link DatatypeA}, {@link DatatypeB}, {@link DatatypeC} and
 * {@link DatatypeD} values, as any of them is also a valid {@link DatatypeE}.
 * Any `undefined` entry in `segments` is filtered automatically.
 *
 * @example
 * ```typescript
 * const output = join(
 *   datatypeA(" ").value,
 *   datatypeB("Lorem").value,
 *   datatypeC("ipsum").value,
 *   datatypeD("dolor").value,
 *   undefined,
 *   datatypeE("sit").value,
 * );
 * // "Lorem ipsum dolor sit" - still DatatypeE no plain string
 * ```
 */
export function join(
  separator: DatatypeA | DatatypeB | DatatypeC | DatatypeD | DatatypeE,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- false positive
  ...segments: readonly (
    | DatatypeA
    | DatatypeB
    | DatatypeC
    | DatatypeD
    | DatatypeE
    | undefined
  )[]
): DatatypeE {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return segments
    .filter((segment) => segment !== undefined)
    .join(separator) as unknown as DatatypeE;
}

/*
 * This is the original restriction pattern in the XML schema definition (XSD) of
 * DIN 91379 as delivered in the XJustiz specification bundle.
 *
 * The pattern was authored with prioritizing the pre-composed Unicode format
 * where available. This means strings in decomposed Unicode format must first be
 * composed before the pattern can match properly.
 */
const ORIGINAL_XSD_PATTERN = String.raw`([&#x0009;-&#x000A;]|&#x000D;|[&#x0020;-&#x007E;]|[&#x00A0;-&#x00AC;]|[&#x00AE;-&#x017E;]|[&#x0187;-&#x0188;]|&#x018F;|&#x0192;|&#x0197;|[&#x01A0;-&#x01A1;]|[&#x01AF;-&#x01B0;]|&#x01B7;|[&#x01CD;-&#x01DC;]|[&#x01DE;-&#x01DF;]|[&#x01E2;-&#x01F0;]|[&#x01F4;-&#x01F5;]|[&#x01F8;-&#x01FF;]|[&#x0212;-&#x0213;]|[&#x0218;-&#x021B;]|[&#x021E;-&#x021F;]|[&#x0227;-&#x0233;]|&#x0259;|&#x0268;|&#x0292;|&#x02B0;|&#x02B3;|[&#x02B9;-&#x02BA;]|[&#x02BE;-&#x02BF;]|&#x02C6;|&#x02C8;|&#x02CC;|&#x02DC;|&#x02E2;|&#x0386;|[&#x0388;-&#x038A;]|&#x038C;|[&#x038E;-&#x03A1;]|[&#x03A3;-&#x03CE;]|&#x040D;|[&#x0410;-&#x042A;]|&#x042C;|[&#x042E;-&#x044A;]|&#x044C;|[&#x044E;-&#x044F;]|&#x045D;|&#x1D48;|&#x1D57;|[&#x1E02;-&#x1E03;]|[&#x1E06;-&#x1E07;]|[&#x1E0A;-&#x1E11;]|&#x1E17;|[&#x1E1C;-&#x1E2B;]|[&#x1E2F;-&#x1E37;]|[&#x1E3A;-&#x1E3B;]|[&#x1E40;-&#x1E49;]|[&#x1E52;-&#x1E5B;]|[&#x1E5E;-&#x1E63;]|[&#x1E6A;-&#x1E6F;]|[&#x1E80;-&#x1E87;]|[&#x1E8C;-&#x1E97;]|&#x1E9E;|[&#x1EA0;-&#x1EF9;]|[&#x2018;-&#x201A;]|[&#x201C;-&#x201E;]|[&#x2020;-&#x2021;]|&#x2026;|&#x2030;|[&#x2032;-&#x2033;]|[&#x2039;-&#x203A;]|&#x2070;|[&#x2074;-&#x2079;]|[&#x207F;-&#x2089;]|&#x20AC;|&#x2122;|&#x221E;|[&#x2264;-&#x2265;]|&#x0041;&#x030B;|&#x0043;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0044;&#x0302;|&#x0046;(&#x0300;|&#x0304;)|&#x0047;&#x0300;|&#x0048;(&#x0304;|&#x0326;|&#x0331;)|&#x004A;(&#x0301;|&#x030C;)|&#x004B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0048;|&#x035F;&#x0068;)|&#x004C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x004D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x004E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0050;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0052;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0053;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0054;(&#x0300;|&#x0304;|&#x0308;|&#x0315;|&#x031B;)|&#x0055;&#x0307;|&#x005A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x0061;&#x030B;|&#x0063;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0064;&#x0302;|&#x0066;(&#x0300;|&#x0304;)|&#x0067;&#x0300;|&#x0068;(&#x0304;|&#x0326;)|&#x006A;&#x0301;|&#x006B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0068;)|&#x006C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x006D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x006E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0070;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0072;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0073;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0074;(&#x0300;|&#x0304;|&#x0315;|&#x031B;)|&#x0075;&#x0307;|&#x007A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x00C7;&#x0306;|&#x00DB;&#x0304;|&#x00E7;&#x0306;|&#x00FB;&#x0304;|&#x00FF;&#x0301;|&#x010C;(&#x0315;|&#x0323;)|&#x010D;(&#x0315;|&#x0323;)|&#x0113;&#x030D;|&#x012A;&#x0301;|&#x012B;&#x0301;|&#x014D;&#x030D;|&#x017D;(&#x0326;|&#x0327;)|&#x017E;(&#x0326;|&#x0327;)|&#x1E32;&#x0304;|&#x1E33;&#x0304;|&#x1E62;&#x0304;|&#x1E63;&#x0304;|&#x1E6C;&#x0304;|&#x1E6D;&#x0304;|&#x1EA0;&#x0308;|&#x1EA1;&#x0308;|&#x1ECC;&#x0308;|&#x1ECD;&#x0308;|&#x1EE4;(&#x0304;|&#x0308;)|&#x1EE5;(&#x0304;|&#x0308;))*`;

const DATATYPE_E_PATTERN =
  transformXsdPatternToJavaScriptExpression(ORIGINAL_XSD_PATTERN);

if (import.meta.vitest) {
  const { describe, it, test, expect, expectTypeOf, vi } = import.meta.vitest;

  /*
   * We don't try to test the original, copy-pasted pattern throughout, but
   * primarily focus on the implementation as refined type. Though we use an
   * extensive list of diverse real world examples. The pattern transformation
   * requires extra attention, protected by test.
   */
  // oxlint-disable-next-line max-lines-per-function -- normal describe block
  describe("Datatype E", async () => {
    const {
      assert,
      property,
      oneof,
      constant,
      string: arbitraryString,
      array: arbitraryArray,
    } = await import("fast-check");
    const { datatypeA } = await import("./datatypeA");
    const { datatypeB } = await import("./datatypeB");
    const { datatypeC } = await import("./datatypeC");
    const { datatypeD } = await import("./datatypeD");

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("runtime parsing", () => {
      it("is successful for an empty string", () => {
        expect(datatypeE("")).toStrictEqual({ value: "" });
      });

      test.each([
        // Nicht-Buchstaben N1 (Standard texts)
        "Muster GmbH",
        "Société Anonyme",
        "-15",

        // Nicht-Buchstaben N1 and N2 (Punctuation and symbols)
        "Company & Co. KG",
        '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~',
        "¡¢£¥ª«¬®¯²³¶¹º»¿×÷€",

        // Nicht-Buchstaben N2 and N3 (Fractions and math operators)
        "¼½¾",
        "1¼+2½=3¾",
        "0.5×¾÷¼",

        // Nicht-Buchstaben N1, N2, and N3 (Corporate formatting symbols)
        "§123&Co.©®°",
        "¤100,00 ® ©",

        // Nicht-Buchstaben N4 (Control strings and whitespaces)
        "Muster GmbH\nAbteilung IT",
        "Société Anonyme\t15",
        "\t\n\r\u00A0",

        // Griechische Buchstaben with N1-N4 (Greek texts)
        "Εταιρεία Α.Ε.",
        "Τράπεζα της Ελλάδος\nΑθήνα",
        "ΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
        "αβγδεζηθικλμνξοπρστυφχψω",

        // Kyrillische Buchstaben with N1-N4 (Cyrillic texts)
        "Невский проспект, 15",
        "ОАО «Компания»",
        "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ",
        "абвгдежзийклмнопрстуфхцчшщъьюя",

        // Nicht-Buchstaben E1 (Trademarks, math, indices)
        "Product™ Name",
        "“SmartProduct”",
        "100‰ Growth",
        "A ≤ B",
        "∞ Possibilities",
        "Product ₂",

        // Mixed Lateinische, Griechische, Kyrillische Buchstaben with N1-N4 and E1
        "Company™ (Ελλάς) & ОАО «Компания»\n100‰ Growth",
        "Α & Β = Γ™\nНевский ₁",
      ])(
        "is successful for comprehensive names of legal entities, products, and free text: '%s'",
        (input) => {
          expect(datatypeE(input)).toStrictEqual({ value: input });
        },
      );

      test.each<
        Readonly<{ input: string; invalidCharacters: Readonly<Set<string>> }>
      >([
        // Arabic Characters
        {
          input: "محمد",
          invalidCharacters: new Set(["م", "ح", "د"]),
        },
        // Hebrew Characters
        {
          input: "יצחק",
          invalidCharacters: new Set(["י", "צ", "ח", "ק"]),
        },
        // Japanese Characters
        {
          input: "こんにちは",
          invalidCharacters: new Set(["こ", "ん", "に", "ち", "は"]),
        },
        // Emoji
        {
          input: "Company 🚀",
          invalidCharacters: new Set(["🚀"]),
        },
      ])(
        "fails for characters not allowed by DIN 91379 Datentyp E: '$input'",
        ({ input, invalidCharacters }) => {
          const template = vi.fn();
          datatypeE.customize({ invalidCharacters: template })(input);
          expect(template).toHaveBeenCalledWith(invalidCharacters);
        },
      );

      it("always reports at least one invalid character when failing", () => {
        assert(
          property(arbitraryString({ unit: "grapheme" }), (input) => {
            const result = datatypeE.customize({
              invalidCharacters: (characters) => [...characters].join(""),
            })(input);

            return result.issues === undefined || result.issues.length > 0; // oxlint-disable-line no-conditional-in-test -- seems not fixable
          }),
        );
      });
    });

    describe("compile-time parsing", () => {
      it("is predetermined to succeed for an empty string", () => {
        expectTypeOf(datatypeE("")).toEqualTypeOf<SuccessResult<DatatypeE>>();
      });

      it("is predetermined to succeed for valid ASCII, Greek, Cyrillic, N4, and E1 characters", () => {
        expectTypeOf(datatypeE("Εταιρεία Α.Ε.")).toEqualTypeOf<
          SuccessResult<DatatypeE>
        >();
        expectTypeOf(datatypeE("Невский")).toEqualTypeOf<
          SuccessResult<DatatypeE>
        >();
        expectTypeOf(datatypeE("Product™\n")).toEqualTypeOf<
          SuccessResult<DatatypeE>
        >();
        expectTypeOf(datatypeE("Company & Co. KG")).toEqualTypeOf<
          SuccessResult<DatatypeE>
        >();
      });

      it("remains undetermined for non-static string literals", () => {
        const dynamicInput = String.raw`Εταιρεία`;
        expectTypeOf(datatypeE(dynamicInput)).toEqualTypeOf<
          Result<DatatypeE>
        >();
      });
    });

    describe("join", () => {
      it("correctly joins all segments with the given seperator, filtering undefined segments", () => {
        const output = join(
          datatypeA(" ").value,
          datatypeB("Lorem").value,
          datatypeC("ipsum").value,
          datatypeD("dolor").value,
          undefined,
          datatypeE("sit").value,
        );

        expect(output).toEqual("Lorem ipsum dolor sit");
      });

      it("produces only valid DatatypeE outputs that could be parsed again", () => {
        assert(
          property(
            arbitraryDatatypeAOrBOrCOrDOrE(),
            arbitraryArray(
              oneof(arbitraryDatatypeAOrBOrCOrDOrE(), constant(undefined)), // oxlint-disable-line no-useless-undefined -- valid test case
            ),
            (separator, segments) => {
              const output = join(separator, ...segments);
              expect(datatypeE(output)).toStrictEqual({ value: output });
            },
          ),
        );
      });
    });

    /*
     * When this test case fails, make sure that:
     * - the original input XSD pattern has changed by intention (only by
     * specification update)
     * - all invariants, transformation steps, and assumptions of the pattern
     * in this module still apply
     *
     * BE EXTRA CAREFUL!
     */
    test("prevent regression of XSD pattern transformation and enforce careful updates", () => {
      expect(DATATYPE_E_PATTERN).toMatchInlineSnapshot(
        `/\\^\\(\\?:\\[\\\\u0009-\\\\u000A\\]\\|\\\\u000D\\|\\[\\\\u0020-\\\\u007E\\]\\|\\[\\\\u00A0-\\\\u00AC\\]\\|\\[\\\\u00AE-\\\\u017E\\]\\|\\[\\\\u0187-\\\\u0188\\]\\|\\\\u018F\\|\\\\u0192\\|\\\\u0197\\|\\[\\\\u01A0-\\\\u01A1\\]\\|\\[\\\\u01AF-\\\\u01B0\\]\\|\\\\u01B7\\|\\[\\\\u01CD-\\\\u01DC\\]\\|\\[\\\\u01DE-\\\\u01DF\\]\\|\\[\\\\u01E2-\\\\u01F0\\]\\|\\[\\\\u01F4-\\\\u01F5\\]\\|\\[\\\\u01F8-\\\\u01FF\\]\\|\\[\\\\u0212-\\\\u0213\\]\\|\\[\\\\u0218-\\\\u021B\\]\\|\\[\\\\u021E-\\\\u021F\\]\\|\\[\\\\u0227-\\\\u0233\\]\\|\\\\u0259\\|\\\\u0268\\|\\\\u0292\\|\\\\u02B0\\|\\\\u02B3\\|\\[\\\\u02B9-\\\\u02BA\\]\\|\\[\\\\u02BE-\\\\u02BF\\]\\|\\\\u02C6\\|\\\\u02C8\\|\\\\u02CC\\|\\\\u02DC\\|\\\\u02E2\\|\\\\u0386\\|\\[\\\\u0388-\\\\u038A\\]\\|\\\\u038C\\|\\[\\\\u038E-\\\\u03A1\\]\\|\\[\\\\u03A3-\\\\u03CE\\]\\|\\\\u040D\\|\\[\\\\u0410-\\\\u042A\\]\\|\\\\u042C\\|\\[\\\\u042E-\\\\u044A\\]\\|\\\\u044C\\|\\[\\\\u044E-\\\\u044F\\]\\|\\\\u045D\\|\\\\u1D48\\|\\\\u1D57\\|\\[\\\\u1E02-\\\\u1E03\\]\\|\\[\\\\u1E06-\\\\u1E07\\]\\|\\[\\\\u1E0A-\\\\u1E11\\]\\|\\\\u1E17\\|\\[\\\\u1E1C-\\\\u1E2B\\]\\|\\[\\\\u1E2F-\\\\u1E37\\]\\|\\[\\\\u1E3A-\\\\u1E3B\\]\\|\\[\\\\u1E40-\\\\u1E49\\]\\|\\[\\\\u1E52-\\\\u1E5B\\]\\|\\[\\\\u1E5E-\\\\u1E63\\]\\|\\[\\\\u1E6A-\\\\u1E6F\\]\\|\\[\\\\u1E80-\\\\u1E87\\]\\|\\[\\\\u1E8C-\\\\u1E97\\]\\|\\\\u1E9E\\|\\[\\\\u1EA0-\\\\u1EF9\\]\\|\\[\\\\u2018-\\\\u201A\\]\\|\\[\\\\u201C-\\\\u201E\\]\\|\\[\\\\u2020-\\\\u2021\\]\\|\\\\u2026\\|\\\\u2030\\|\\[\\\\u2032-\\\\u2033\\]\\|\\[\\\\u2039-\\\\u203A\\]\\|\\\\u2070\\|\\[\\\\u2074-\\\\u2079\\]\\|\\[\\\\u207F-\\\\u2089\\]\\|\\\\u20AC\\|\\\\u2122\\|\\\\u221E\\|\\[\\\\u2264-\\\\u2265\\]\\|\\\\u0041\\\\u030B\\|\\\\u0043\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0044\\\\u0302\\|\\\\u0046\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0047\\\\u0300\\|\\\\u0048\\(\\?:\\\\u0304\\|\\\\u0326\\|\\\\u0331\\)\\|\\\\u004A\\(\\?:\\\\u0301\\|\\\\u030C\\)\\|\\\\u004B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0048\\|\\\\u035F\\\\u0068\\)\\|\\\\u004C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u004D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u004E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0050\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0052\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0053\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0054\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0308\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0055\\\\u0307\\|\\\\u005A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u0061\\\\u030B\\|\\\\u0063\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0064\\\\u0302\\|\\\\u0066\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0067\\\\u0300\\|\\\\u0068\\(\\?:\\\\u0304\\|\\\\u0326\\)\\|\\\\u006A\\\\u0301\\|\\\\u006B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0068\\)\\|\\\\u006C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u006D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u006E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0070\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0072\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0073\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0074\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0075\\\\u0307\\|\\\\u007A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u00C7\\\\u0306\\|\\\\u00DB\\\\u0304\\|\\\\u00E7\\\\u0306\\|\\\\u00FB\\\\u0304\\|\\\\u00FF\\\\u0301\\|\\\\u010C\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u010D\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u0113\\\\u030D\\|\\\\u012A\\\\u0301\\|\\\\u012B\\\\u0301\\|\\\\u014D\\\\u030D\\|\\\\u017D\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u017E\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u1E32\\\\u0304\\|\\\\u1E33\\\\u0304\\|\\\\u1E62\\\\u0304\\|\\\\u1E63\\\\u0304\\|\\\\u1E6C\\\\u0304\\|\\\\u1E6D\\\\u0304\\|\\\\u1EA0\\\\u0308\\|\\\\u1EA1\\\\u0308\\|\\\\u1ECC\\\\u0308\\|\\\\u1ECD\\\\u0308\\|\\\\u1EE4\\(\\?:\\\\u0304\\|\\\\u0308\\)\\|\\\\u1EE5\\(\\?:\\\\u0304\\|\\\\u0308\\)\\)\\*\\$/u`,
      );
    });

    function arbitraryDatatypeAOrBOrCOrDOrE() {
      function arbitraryDatatype(
        // oxlint-disable-next-line prefer-readonly-parameter-types -- false positive
        factory:
          | typeof datatypeA
          | typeof datatypeB
          | typeof datatypeC
          | typeof datatypeD
          | typeof datatypeE,
      ) {
        return arbitraryString({ unit: "grapheme" })
          .map((input) => factory(input))
          .filter((result) => result.issues === undefined)
          .map((result) => result.value);
      }

      return oneof(
        arbitraryDatatype(datatypeA),
        arbitraryDatatype(datatypeB),
        arbitraryDatatype(datatypeC),
        arbitraryDatatype(datatypeD),
        arbitraryDatatype(datatypeE),
      );
    }
  });
}
