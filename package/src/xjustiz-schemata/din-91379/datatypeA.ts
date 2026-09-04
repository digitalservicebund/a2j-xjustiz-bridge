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
  type LateinischeBuchstabenIncomplete,
  type NichtBuchstabenN1,
} from "./schriftzeichengruppe";
import { findInvalidCharacters } from "./unicode";
import { transformXsdPatternToJavaScriptExpression } from "~/xjustiz-schemata/xml-schema-definition/restriction-pattern";

declare const TAG: unique symbol;

/**
 * Datatype A of the DIN 91379 norm. A string with restricted character set.
 *
 * Meant to be used for names of natural persons on sovereign official documents.
 * That includes all Latin characters, plus additional non-letters of group N1
 * ("Nicht-Buchstaben N1") that are necessary to represent names and for
 * romanizing transliterations.
 *
 * See the related {@link datatypeA | refined type factory} for construction.
 *
 * Available operations that maintain the type:
 *   - {@link join}
 */
export type DatatypeA = string & {
  readonly [TAG]: "Use the `datatypeA` factory to construct valid instances.";
};

function parseDatatypeA(
  issueMessages: DatatypeAIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  return function parse(input: string): Result<DatatypeA> {
    const composedUnicodeInput = input.normalize("NFC");

    if (DATATYPE_A_PATTERN.test(composedUnicodeInput)) {
      // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
      return { value: composedUnicodeInput as unknown as DatatypeA };
      // oxlint-disable-next-line no-else-return -- false positive
    } else {
      const characters = findInvalidCharacters(
        composedUnicodeInput,
        DATATYPE_A_PATTERN,
      );

      return {
        issues: [{ message: issueMessages.invalidCharacters(characters) }],
      };
    }
  } as <Value extends string>(
    input: Value,
  ) => LiteralAwareResult<string, Value, ParseDatatypeA<Value>, DatatypeA>;
}

const DEFAULT_ISSUE_MESSAGES = {
  /**
   * @param characters - graphemes as phoneme units in composed Unicode format
   */
  invalidCharacters: (characters: Readonly<Set<string>>) =>
    `Contains characters not allowed by DIN 91379 Datentyp A: ${[...characters].map((character) => `'${character}'`).join(", ")}`,
} as const;

type DatatypeAIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParseDatatypeA<Value extends string> =
  IsLiteral<Value, string> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : ConsumeCharactersFrom<Value, DatatypeACharacterIncomplete> extends ""
      ? SuccessResult<DatatypeA>
      : ConsumeCharactersFrom<
            Value,
            DatatypeACharacterIncomplete
          > extends `${infer InvalidCharacter extends GuaranteedInvalidCharacter}${string}`
        ? FailureResult<`Contains characters not allowed by DIN 91379 Datentyp A: ${InvalidCharacter}`>
        : Result<DatatypeA>;

/**
 * Factory function object for the {@link DatatypeA} refined type. See
 * {@link RefinedTypeFactory} for further details, usage examples, and
 * customization.
 *
 * Support for partial compile-time parsing of static string literals. Only a
 * subset of the full characters set that is tested at runtime is supported.
 * Primarily, multi code point Unicode sequences are excluded. For static string
 * literals with characters outside the supported range, the result stays
 * undetermined and compile-time evaluation is necessary. However, a small set
 * of characters that are known to be invalid will resolve to a failure result,
 * like digits and many symbols.
 *
 * @example
 * ```typescript
 * datatypeA("Erika Musterfrau").value; // success (compile-time parsing)
 * datatypeA("Max1 (Friedrich) Mustermann") // failure (compile-time parsing)
 * const someResult = datatypeA("Íñigo de Loyola"); // undetermined
 * const otherResult = datatypeA(someDynamicInput); // always undetermined
 * const mySchema = someSchemaLibrary({ name: datatypeA }) // via Standard Schema
 * ```
 */
export const datatypeA = defineRefinedType(isString, parseDatatypeA);

/**
 * Adapted version of the default {@link Array.prototype.join} operation that
 * maintains the invariants of {@link DatatypeA}. Any `undefined` entry in
 * `segments` is filtered automatically.

 * @example
 * ```typescript
 * const fullName = join(
 *   datatypeA(" ").value,
 *   datatypeA("Frau").value,
 *   datatypeA("Erika").value,
 *   undefined,
 *   datatypeA("Musterfrau").value,
 * );
 * // "Frau Erika Musterfrau" - still DatatypeA no plain string
 * ```
 */
export function join(
  separator: DatatypeA,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- false positive
  ...segments: readonly (DatatypeA | undefined)[]
): DatatypeA {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return segments
    .filter((segment) => segment !== undefined)
    .join(separator) as unknown as DatatypeA;
}

/*
 * This is the original restriction pattern in the XML schema definition (XSD) of
 * DIN 91379 as delivered in the XJustiz specification bundle.
 *
 * The pattern was authored with prioritizing the pre-composed Unicode format
 * where available. This means strings in decomposed Unicode format must first be
 * composed before the pattern can match properly.
 */
const ORIGINAL_XSD_PATTERN = String.raw`(&#x0020;|&#x0027;|[&#x002C;-\&#x002E;]|[&#x0041;-&#x005A;]|[&#x0060;-&#x007A;]|&#x007E;|&#x00A8;|&#x00B4;|&#x00B7;|[&#x00C0;-&#x00D6;]|[&#x00D8;-&#x00F6;]|[&#x00F8;-&#x017E;]|[&#x0187;-&#x0188;]|&#x018F;|&#x0197;|[&#x01A0;-&#x01A1;]|[&#x01AF;-&#x01B0;]|&#x01B7;|[&#x01CD;-&#x01DC;]|[&#x01DE;-&#x01DF;]|[&#x01E2;-&#x01F0;]|[&#x01F4;-&#x01F5;]|[&#x01F8;-&#x01FF;]|[&#x0212;-&#x0213;]|[&#x0218;-&#x021B;]|[&#x021E;-&#x021F;]|[&#x0227;-&#x0233;]|&#x0259;|&#x0268;|&#x0292;|[&#x02B9;-&#x02BA;]|[&#x02BE;-&#x02BF;]|&#x02C8;|&#x02CC;|[&#x1E02;-&#x1E03;]|[&#x1E06;-&#x1E07;]|[&#x1E0A;-&#x1E11;]|&#x1E17;|[&#x1E1C;-&#x1E2B;]|[&#x1E2F;-&#x1E37;]|[&#x1E3A;-&#x1E3B;]|[&#x1E40;-&#x1E49;]|[&#x1E52;-&#x1E5B;]|[&#x1E5E;-&#x1E63;]|[&#x1E6A;-&#x1E6F;]|[&#x1E80;-&#x1E87;]|[&#x1E8C;-&#x1E97;]|&#x1E9E;|[&#x1EA0;-&#x1EF9;]|&#x2019;|&#x2021;|&#x0041;&#x030B;|&#x0043;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0044;&#x0302;|&#x0046;(&#x0300;|&#x0304;)|&#x0047;&#x0300;|&#x0048;(&#x0304;|&#x0326;|&#x0331;)|&#x004A;(&#x0301;|&#x030C;)|&#x004B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0048;|&#x035F;&#x0068;)|&#x004C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x004D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x004E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0050;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0052;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0053;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0054;(&#x0300;|&#x0304;|&#x0308;|&#x0315;|&#x031B;)|&#x0055;&#x0307;|&#x005A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x0061;&#x030B;|&#x0063;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0064;&#x0302;|&#x0066;(&#x0300;|&#x0304;)|&#x0067;&#x0300;|&#x0068;(&#x0304;|&#x0326;)|&#x006A;&#x0301;|&#x006B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0068;)|&#x006C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x006D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x006E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0070;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0072;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0073;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0074;(&#x0300;|&#x0304;|&#x0315;|&#x031B;)|&#x0075;&#x0307;|&#x007A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x00C7;&#x0306;|&#x00DB;&#x0304;|&#x00E7;&#x0306;|&#x00FB;&#x0304;|&#x00FF;&#x0301;|&#x010C;(&#x0315;|&#x0323;)|&#x010D;(&#x0315;|&#x0323;)|&#x0113;&#x030D;|&#x012A;&#x0301;|&#x012B;&#x0301;|&#x014D;&#x030D;|&#x017D;(&#x0326;|&#x0327;)|&#x017E;(&#x0326;|&#x0327;)|&#x1E32;&#x0304;|&#x1E33;&#x0304;|&#x1E62;&#x0304;|&#x1E63;&#x0304;|&#x1E6C;&#x0304;|&#x1E6D;&#x0304;|&#x1EA0;&#x0308;|&#x1EA1;&#x0308;|&#x1ECC;&#x0308;|&#x1ECD;&#x0308;|&#x1EE4;(&#x0304;|&#x0308;)|&#x1EE5;(&#x0304;|&#x0308;))*`;

const DATATYPE_A_PATTERN =
  transformXsdPatternToJavaScriptExpression(ORIGINAL_XSD_PATTERN);

type DatatypeACharacterIncomplete =
  | LateinischeBuchstabenIncomplete
  | NichtBuchstabenN1;

// prettier-ignore
type GuaranteedInvalidCharacter = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "#" | "$" | "%" | "&" | "*" | "+" | "/" | "<" | "=" | ">" | "@" | "\\" | "^" | "_" | "|" | "!" | '"' | "(" | ")" | ":" | ";" | "?" | "[" | "]" | "{" | "}";

if (import.meta.vitest) {
  const { describe, it, test, expect, expectTypeOf, vi } = import.meta.vitest;

  /*
   * We don't try to test the original, copy-pasted pattern throughout, but
   * primarily focus on the implementation as refined type. Though we use an
   * extensive list of diverse real world examples. The pattern transformation
   * requires extra attention, protected by test.
   */
  // oxlint-disable-next-line max-lines-per-function -- normal describe block
  describe("Datatype A", async () => {
    const {
      assert,
      property,
      oneof,
      constant,
      string: arbitraryString,
      array: arbitraryArray,
    } = await import("fast-check");

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("runtime parsing", () => {
      it("is successful for an empty string", () => {
        expect(datatypeA("")).toStrictEqual({ value: "" });
      });

      test.each([
        "Erika Musterfrau",
        "Íñigo de Loyola",
        "Marie-Hélène LefèvreFrenchhyphen",
        "François d'AlembertFrenchç",
        "José María García",
        "Giò Ponti",
        "Jörg Müller",
        "Käthe Kollwitz",
        "João Fernández",
        "Avel·lí Artís Gener",
        "Søren Aabye Kierkegaard",
        "Þóra JónsdóttirIcelandicÞ",
        "Owain GlyndŵrWelshŵ",
        "Małgorzata Szymborska",
        "Jiří Dvořák",
        "Ľubomír ŠimkoSlovakĽ",
        "Şükrü Öztürk",
        "Thị LươngVietnameseị",
        "Heydər Əliyev",
        "Kōnstantinos Kavaphēs",
        "Nikolaĭ Vasilʹevich Gogol",
        "Mošeh ben Maimon",
        "Shemuel Yosef ʿAgnon",
        "Yiṣḥaḳ Rabin",
        "Muḥammad ibn ʿAbd Allāh",
        "Fāṭimah al-Zahrāʾ",
        "Ẓāhir al-Dīn Muḥammad Bābur",
        "K͟hālid ibn al-Walīd",
      ])("is successful for international example name: '%s'", (name) => {
        expect(datatypeA(name)).toStrictEqual({ value: name });
      });

      test.each<
        Readonly<{ name: string; invalidCharacters: Readonly<Set<string>> }>
      >([
        { name: "Max Must3rmann", invalidCharacters: new Set(["3"]) },
        {
          name: "Max1 (Friedrich) Mustermann",
          invalidCharacters: new Set(["1", "(", ")"]),
        },
      ])(
        "fails for structurally invalid inputs: '%s'",
        ({ name, invalidCharacters }) => {
          const template = vi.fn();
          datatypeA.customize({ invalidCharacters: template })(name);
          expect(template).toHaveBeenCalledWith(invalidCharacters);
        },
      );

      test.each<
        Readonly<{ name: string; invalidCharacters: Readonly<Set<string>> }>
      >([
        {
          name: "Νίκος",
          invalidCharacters: new Set(["Ν", "ί", "κ", "ο", "ς"]),
        },
        {
          name: "محمد علي",
          invalidCharacters: new Set(["م", "ح", "د", "ع", "ل", "ي"]),
        },
        {
          name: "יצחק רבין",
          invalidCharacters: new Set(["י", "צ", "ח", "ק", "ר", "ב", "י", "ן"]),
        },
        {
          name: "خالد",
          invalidCharacters: new Set(["خ", "ا", "ل", "د"]),
        },
      ])(
        "fails for not romanized transliterations for international names: '%s'",
        ({ name, invalidCharacters }) => {
          const template = vi.fn();
          datatypeA.customize({ invalidCharacters: template })(name);
          expect(template).toHaveBeenCalledWith(invalidCharacters);
        },
      );

      it("always reports at least one invalid character when failing", () => {
        assert(
          property(arbitraryString({ unit: "grapheme" }), (input) => {
            const result = datatypeA.customize({
              invalidCharacters: (characters) => [...characters].join(""),
            })(input);

            return result.issues === undefined || result.issues.length > 0; // oxlint-disable-line no-conditional-in-test -- seems not fixable
          }),
        );
      });
    });

    describe("compile-time parsing", () => {
      it("is predetermined to succeed for an empty string", () => {
        expectTypeOf(datatypeA("")).toEqualTypeOf<SuccessResult<DatatypeA>>();
      });

      it("is predetermined to succeed for valid ASCII range and Nicht-Buchstaben N1", () => {
        expectTypeOf(datatypeA("Erika Musterfrau")).toEqualTypeOf<
          SuccessResult<DatatypeA>
        >();

        expectTypeOf(datatypeA("Marie-Luise von Braun")).toEqualTypeOf<
          SuccessResult<DatatypeA>
        >();

        expectTypeOf(datatypeA(" ',-.`~¨´·ʹʺʾʿˈˌ’‡")).toEqualTypeOf<
          SuccessResult<DatatypeA>
        >();
      });

      it("is predetermined to fail for a invalid ASCII range symbols", () => {
        expectTypeOf(datatypeA("1")).toEqualTypeOf<
          FailureResult<"Contains characters not allowed by DIN 91379 Datentyp A: 1">
        >();

        expectTypeOf(datatypeA("Max1")).toEqualTypeOf<
          FailureResult<"Contains characters not allowed by DIN 91379 Datentyp A: 1">
        >();

        expectTypeOf(datatypeA("a@b!c?")).toEqualTypeOf<
          FailureResult<"Contains characters not allowed by DIN 91379 Datentyp A: @">
        >();
      });

      it("remains undetermined for valid and invalid inputs outside the supported range of Lateinische Buchstaben", () => {
        expectTypeOf(datatypeA("González")).toEqualTypeOf<Result<DatatypeA>>();
        expectTypeOf(datatypeA("יצחק רבין")).toEqualTypeOf<Result<DatatypeA>>();
      });

      it("remains undetermined for non static string literals", () => {
        const dynamicInput = String.raw`Erika Musterfrau`;
        expectTypeOf(datatypeA(dynamicInput)).toEqualTypeOf<
          Result<DatatypeA>
        >();
      });
    });

    describe("join", () => {
      it("correctly joins all segments with the given seperator, filtering undefined segments", () => {
        const output = join(
          datatypeA(" ").value,
          datatypeA("Frau").value,
          datatypeA("Erika").value,
          undefined,
          datatypeA("Musterfrau").value,
        );

        expect(output).toEqual("Frau Erika Musterfrau");
      });

      it("produces only valid DatatypeA outputs that could be parsed again", () => {
        assert(
          property(
            arbitraryDatatypeA(),
            arbitraryArray(
              oneof(arbitraryDatatypeA(), constant(undefined)), // oxlint-disable-line no-useless-undefined -- valid test case
            ),
            (separator, segments) => {
              const output = join(separator, ...segments);
              expect(datatypeA(output)).toStrictEqual({ value: output });
            },
          ),
        );
      });
    });

    /*
     * When this test case fails, make sure that:
     *  - the original input XSD pattern has changed by intention (only by
     *    specification update)
     *  - all invariants, transformation steps, and assumptions of the pattern
     *    in this module still apply
     *
     * BE EXTRA CAREFUL!
     */
    test("prevent regression of XSD pattern transformation and enforce careful updates", () => {
      expect(DATATYPE_A_PATTERN).toMatchInlineSnapshot(
        `/\\^\\(\\?:\\\\u0020\\|\\\\u0027\\|\\[\\\\u002C-\\\\u002E\\]\\|\\[\\\\u0041-\\\\u005A\\]\\|\\[\\\\u0060-\\\\u007A\\]\\|\\\\u007E\\|\\\\u00A8\\|\\\\u00B4\\|\\\\u00B7\\|\\[\\\\u00C0-\\\\u00D6\\]\\|\\[\\\\u00D8-\\\\u00F6\\]\\|\\[\\\\u00F8-\\\\u017E\\]\\|\\[\\\\u0187-\\\\u0188\\]\\|\\\\u018F\\|\\\\u0197\\|\\[\\\\u01A0-\\\\u01A1\\]\\|\\[\\\\u01AF-\\\\u01B0\\]\\|\\\\u01B7\\|\\[\\\\u01CD-\\\\u01DC\\]\\|\\[\\\\u01DE-\\\\u01DF\\]\\|\\[\\\\u01E2-\\\\u01F0\\]\\|\\[\\\\u01F4-\\\\u01F5\\]\\|\\[\\\\u01F8-\\\\u01FF\\]\\|\\[\\\\u0212-\\\\u0213\\]\\|\\[\\\\u0218-\\\\u021B\\]\\|\\[\\\\u021E-\\\\u021F\\]\\|\\[\\\\u0227-\\\\u0233\\]\\|\\\\u0259\\|\\\\u0268\\|\\\\u0292\\|\\[\\\\u02B9-\\\\u02BA\\]\\|\\[\\\\u02BE-\\\\u02BF\\]\\|\\\\u02C8\\|\\\\u02CC\\|\\[\\\\u1E02-\\\\u1E03\\]\\|\\[\\\\u1E06-\\\\u1E07\\]\\|\\[\\\\u1E0A-\\\\u1E11\\]\\|\\\\u1E17\\|\\[\\\\u1E1C-\\\\u1E2B\\]\\|\\[\\\\u1E2F-\\\\u1E37\\]\\|\\[\\\\u1E3A-\\\\u1E3B\\]\\|\\[\\\\u1E40-\\\\u1E49\\]\\|\\[\\\\u1E52-\\\\u1E5B\\]\\|\\[\\\\u1E5E-\\\\u1E63\\]\\|\\[\\\\u1E6A-\\\\u1E6F\\]\\|\\[\\\\u1E80-\\\\u1E87\\]\\|\\[\\\\u1E8C-\\\\u1E97\\]\\|\\\\u1E9E\\|\\[\\\\u1EA0-\\\\u1EF9\\]\\|\\\\u2019\\|\\\\u2021\\|\\\\u0041\\\\u030B\\|\\\\u0043\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0044\\\\u0302\\|\\\\u0046\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0047\\\\u0300\\|\\\\u0048\\(\\?:\\\\u0304\\|\\\\u0326\\|\\\\u0331\\)\\|\\\\u004A\\(\\?:\\\\u0301\\|\\\\u030C\\)\\|\\\\u004B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0048\\|\\\\u035F\\\\u0068\\)\\|\\\\u004C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u004D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u004E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0050\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0052\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0053\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0054\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0308\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0055\\\\u0307\\|\\\\u005A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u0061\\\\u030B\\|\\\\u0063\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0064\\\\u0302\\|\\\\u0066\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0067\\\\u0300\\|\\\\u0068\\(\\?:\\\\u0304\\|\\\\u0326\\)\\|\\\\u006A\\\\u0301\\|\\\\u006B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0068\\)\\|\\\\u006C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u006D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u006E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0070\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0072\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0073\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0074\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0075\\\\u0307\\|\\\\u007A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u00C7\\\\u0306\\|\\\\u00DB\\\\u0304\\|\\\\u00E7\\\\u0306\\|\\\\u00FB\\\\u0304\\|\\\\u00FF\\\\u0301\\|\\\\u010C\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u010D\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u0113\\\\u030D\\|\\\\u012A\\\\u0301\\|\\\\u012B\\\\u0301\\|\\\\u014D\\\\u030D\\|\\\\u017D\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u017E\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u1E32\\\\u0304\\|\\\\u1E33\\\\u0304\\|\\\\u1E62\\\\u0304\\|\\\\u1E63\\\\u0304\\|\\\\u1E6C\\\\u0304\\|\\\\u1E6D\\\\u0304\\|\\\\u1EA0\\\\u0308\\|\\\\u1EA1\\\\u0308\\|\\\\u1ECC\\\\u0308\\|\\\\u1ECD\\\\u0308\\|\\\\u1EE4\\(\\?:\\\\u0304\\|\\\\u0308\\)\\|\\\\u1EE5\\(\\?:\\\\u0304\\|\\\\u0308\\)\\)\\*\\$/u`,
      );
    });

    function arbitraryDatatypeA() {
      return arbitraryString({ unit: "grapheme" })
        .map((input) => datatypeA(input))
        .filter((result) => result.issues === undefined)
        .map((result) => result.value);
    }
  });
}
