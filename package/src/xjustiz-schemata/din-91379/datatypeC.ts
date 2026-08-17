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
  type NichtBuchstabenN2,
  type NichtBuchstabenN3,
  type NichtBuchstabenN4,
} from "./schriftzeichengruppe";
import { type DatatypeB } from "./datatypeB"; // oxlint-disable-line no-unused-vars -- referenced by TSDoc
import { findInvalidCharacters } from "./unicode";
import { transformXsdPatternToJavaScriptExpression } from "~/xjustiz-schemata/xml-schema-definition/restriction-pattern";

declare const TAG: unique symbol;

/**
 * Datatype C of the DIN 91379 norm. A string with restricted character set.
 *
 * This is an extension of {@link DatatypeB}, meant to be used for general
 * free text. Unlike previous datatypes, Datatype C permits multi-line input
 * (newlines like `\n` and `\r`, tabs, and structural controls from group N4),
 * along with fractions and legal symbols from group N3.
 * Texts with Greek or Cyrillic letters or with extended (nicht-normativen)
 * Nicht-Buchstaben are inadmissible.
 *
 * See the related {@link datatypeC | refined type factory} for construction.
 */
export type DatatypeC = string & {
  readonly [TAG]: "Use the `datatypeC` factory to construct valid instances.";
};

function parseDatatypeC(
  issueMessages: DatatypeCIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  return function parse(input: string): Result<DatatypeC> {
    const composedUnicodeInput = input.normalize("NFC");

    if (DATATYPE_C_PATTERN.test(composedUnicodeInput)) {
      return { value: composedUnicodeInput as unknown as DatatypeC }; // oxlint-disable-line no-unsafe-type-assertion -- explicit cast "trick" for branding

      // oxlint-disable-next-line no-else-return -- false positive
    } else {
      const characters = findInvalidCharacters(
        composedUnicodeInput,
        DATATYPE_C_PATTERN,
      );

      return {
        issues: [{ message: issueMessages.invalidCharacters(characters) }],
      };
    }
  } as <Value extends string>(
    input: Value,
  ) => LiteralAwareResult<string, Value, ParseDatatypeC<Value>, DatatypeC>;
}

const DEFAULT_ISSUE_MESSAGES = {
  /**
   * @param characters - graphemes as phoneme units in composed Unicode format
   */
  invalidCharacters: (characters: Readonly<Set<string>>) =>
    `Contains characters not allowed by DIN 91379 Datentyp C: ${[...characters].map((character) => `'${character}'`).join(", ")}`,
} as const;

type DatatypeCIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParseDatatypeC<Value extends string> =
  IsLiteral<Value, string> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : ConsumeCharactersFrom<Value, DatatypeCCharacterIncomplete> extends ""
      ? SuccessResult<DatatypeC>
      : Result<DatatypeC>;

type DatatypeCCharacterIncomplete =
  | LateinischeBuchstabenIncomplete
  | NichtBuchstabenN1
  | NichtBuchstabenN2
  | NichtBuchstabenN3
  | NichtBuchstabenN4;

/**
 * Factory function object for the {@link DatatypeC} refined type. See
 * {@link RefinedTypeFactory} for further details, usage examples and
 * customization.
 *
 * Support for partial compile-time parsing of static string literals. Only
 * a subset of the full character set that is tested at runtime is supported.
 * This includes the full ASCII range and basic normative layouts, which are allowed.
 * Primarily, multi code point Unicode sequences are excluded. For static string
 * literals with characters outside the supported range, the result stays
 * undetermined and compile-time evaluation is necessary.
 *
 * @example
 * ```typescript
 * datatypeC("Musterfirma GmbH\nAbteilung: IT\tInfo").value; // success (compile-time parsing)
 * const someResult = datatypeC("Text containing Greek characters Νίκος"); // undetermined
 * const otherResult = datatypeC(someDynamicInput); // always undetermined
 * const mySchema = someSchemaLibrary({ notes: datatypeC }); // via Standard Schema
 * ```
 */
export const datatypeC = defineRefinedType(isString, parseDatatypeC);

/*
 * This is the original restriction pattern in the XML schema definition (XSD) of
 * DIN 91379 as delivered in the XJustiz specification bundle.
 *
 * The pattern was authored with prioritizing the pre-composed Unicode format
 * where available. This means strings in decomposed Unicode format must first be
 * composed before the pattern can match properly.
 */
const ORIGINAL_XSD_PATTERN = String.raw`([&#x0009;-&#x000A;]|&#x000D;|[&#x0020;-&#x007E;]|[&#x00A0;-&#x00AC;]|[&#x00AE;-&#x017E;]|[&#x0187;-&#x0188;]|&#x018F;|&#x0197;|[&#x01A0;-&#x01A1;]|[&#x01AF;-&#x01B0;]|&#x01B7;|[&#x01CD;-&#x01DC;]|[&#x01DE;-&#x01DF;]|[&#x01E2;-&#x01F0;]|[&#x01F4;-&#x01F5;]|[&#x01F8;-&#x01FF;]|[&#x0212;-&#x0213;]|[&#x0218;-&#x021B;]|[&#x021E;-&#x021F;]|[&#x0227;-&#x0233;]|&#x0259;|&#x0268;|&#x0292;|[&#x02B9;-&#x02BA;]|[&#x02BE;-&#x02BF;]|&#x02C8;|&#x02CC;|[&#x1E02;-&#x1E03;]|[&#x1E06;-&#x1E07;]|[&#x1E0A;-&#x1E11;]|&#x1E17;|[&#x1E1C;-&#x1E2B;]|[&#x1E2F;-&#x1E37;]|[&#x1E3A;-&#x1E3B;]|[&#x1E40;-&#x1E49;]|[&#x1E52;-&#x1E5B;]|[&#x1E5E;-&#x1E63;]|[&#x1E6A;-&#x1E6F;]|[&#x1E80;-&#x1E87;]|[&#x1E8C;-&#x1E97;]|&#x1E9E;|[&#x1EA0;-&#x1EF9;]|&#x2019;|&#x2021;|&#x20AC;|&#x0041;&#x030B;|&#x0043;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0044;&#x0302;|&#x0046;(&#x0300;|&#x0304;)|&#x0047;&#x0300;|&#x0048;(&#x0304;|&#x0326;|&#x0331;)|&#x004A;(&#x0301;|&#x030C;)|&#x004B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0048;|&#x035F;&#x0068;)|&#x004C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x004D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x004E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0050;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0052;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0053;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0054;(&#x0300;|&#x0304;|&#x0308;|&#x0315;|&#x031B;)|&#x0055;&#x0307;|&#x005A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x0061;&#x030B;|&#x0063;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0064;&#x0302;|&#x0066;(&#x0300;|&#x0304;)|&#x0067;&#x0300;|&#x0068;(&#x0304;|&#x0326;)|&#x006A;&#x0301;|&#x006B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0068;)|&#x006C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x006D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x006E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0070;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0072;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0073;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0074;(&#x0300;|&#x0304;|&#x0315;|&#x031B;)|&#x0075;&#x0307;|&#x007A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x00C7;&#x0306;|&#x00DB;&#x0304;|&#x00E7;&#x0306;|&#x00FB;&#x0304;|&#x00FF;&#x0301;|&#x010C;(&#x0315;|&#x0323;)|&#x010D;(&#x0315;|&#x0323;)|&#x0113;&#x030D;|&#x012A;&#x0301;|&#x012B;&#x0301;|&#x014D;&#x030D;|&#x017D;(&#x0326;|&#x0327;)|&#x017E;(&#x0326;|&#x0327;)|&#x1E32;&#x0304;|&#x1E33;&#x0304;|&#x1E62;&#x0304;|&#x1E63;&#x0304;|&#x1E6C;&#x0304;|&#x1E6D;&#x0304;|&#x1EA0;&#x0308;|&#x1EA1;&#x0308;|&#x1ECC;&#x0308;|&#x1ECD;&#x0308;|&#x1EE4;(&#x0304;|&#x0308;)|&#x1EE5;(&#x0304;|&#x0308;))*`;

const DATATYPE_C_PATTERN =
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
  describe("Datatype C", async () => {
    const {
      assert,
      property,
      string: arbitraryString,
    } = await import("fast-check");

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("runtime parsing", () => {
      it("is successful for an empty string", () => {
        expect(datatypeC("")).toStrictEqual({ value: "" });
      });

      test.each([
        // Contains Nicht-Buchstaben N1 (Valid Hyphen-Minus U+002D edge case)
        "-15",
        "-¼",

        // Contains Nicht-Buchstaben N1 and N2 (Standard punctuation, brackets, and symbol matrices)
        '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~',
        "¡¢£¥ª«¬®¯²³¶¹º»¿×÷€",
        "['\",.-.:;?!()[]{}<>«»/*+-=_^~`]",
        "¿¡!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        "¡\t¢\n£\r¥\u00A0ª\t«\n¬\r®\u00A0¯",
        "²\t³\n¶\u00A0¹\tº\n»\r¿\u00A0×\t÷",

        // Contains Nicht-Buchstaben N2 and N3 (Fractions & Math Operators)
        "¼½¾",
        "1¼+2½=3¾",
        "0.5×¾÷¼",
        "<¼|>¾|=½|~¾",
        "100×½+50-¼",
        "¾×½÷¼12345",

        // Contains Nicht-Buchstaben N1, N2, and N3 (Legal entity & corporate formatting symbols)
        "Text¤¦¸",
        "§123&Co.©®°",
        "¤100,00\u00A0®\u00A0©",
        "§§\t45\u00A0°C\n¦\t¸",
        "&¦&¤&§&©&®&°",
        "¤\t¦\t¸\n§\n&\n©\n®\n°",

        // Contains Nicht-Buchstaben N4 (Control strings, tabs, newlines, and no-break spaces)
        "\t\n\r\u00A0",
        "Text\nText\r\nText\tText",
        "\u00A0\u00A0\t\t\n\n\r\r",
        "\n\t\r\u00A0\u00A0\r\n\t",
        " \t \n \r \u00A0 ",
        "\t\t\t\n\n\n\r\r\r\u00A0\u00A0\u00A0",

        // Contains Lateinische Buchstaben paired with mixed Nicht-Buchstaben N1-N4 (Complex mixed free text)
        "Musterfirma\u00A0GmbH\t§\u00A012\nKapital:\u00A0100.000\u00A0¤\nAnteil:\u00A0¾",
        "Dokumenten-ID:\t123/456_789-X\nErstellungsdatum:\t15.01.2026\r\nStatus:\tFreigegeben\u00A0©",
        "Free\ttext\nfield\rwith\u00A0all\tpossible\ncombinations\rof\u00A0normative\tcharacters!",
        "100\u00A0€\t5%\nZinsfuß:\t³\nRegelung\u00A0gemäß\u00A0§\u00A04\u00A0Absatz\u00A02\u00A0Buchstabe\u00A0a",
        "A\tB\nC\rD\u00A0E\tF\nG\rH\u00A0I\tJ\nK\rL\u00A0M\tN\nO\rP\u00A0Q\tR\nS\rT\u00A0U\tV\nW\rX\u00A0Y\tZ",
        "\"Quote\"\t'Apostrophe'\n(Parentheses)\r[Brackets]\u00A0{Curlies}\t<Angles>",
      ])("is successful for normative free text examples: '%s'", (input) => {
        expect(datatypeC(input)).toStrictEqual({ value: input });
      });

      test.each<
        Readonly<{ input: string; invalidCharacters: Readonly<Set<string>> }>
      >([
        {
          input: "Невский 15",
          invalidCharacters: new Set(["Н", "е", "в", "с", "к", "и", "й"]),
        },
        {
          input: "Ερμού 9",
          invalidCharacters: new Set(["Ε", "ρ", "μ", "ο", "ύ"]),
        },
        {
          input: "Product™ Name",
          invalidCharacters: new Set(["™"]),
        },
        {
          input: "−15", // This negative number uses the Mathematical Minus Sign (−, U+2212)
          invalidCharacters: new Set(["−"]),
        },
        {
          input: "Mustertext\u00ADmit\u00ADSoftHyphen",
          invalidCharacters: new Set(["\u00AD"]),
        },
        {
          input: "Text\u200BWith\u200BZeroWidthSpace",
          invalidCharacters: new Set(["\u200B"]),
        },
        {
          input: "Betrag: 100 ‰",
          invalidCharacters: new Set(["‰"]),
        },
        {
          input: "“Anführungszeichen”",
          invalidCharacters: new Set(["“", "”"]),
        },
        {
          input: "Fehler 🚀",
          invalidCharacters: new Set(["🚀"]),
        },
      ])(
        "fails for characters not allowed by DIN 91379 Datentyp C: '$input'",
        ({ input, invalidCharacters }) => {
          const template = vi.fn();
          datatypeC.customize({ invalidCharacters: template })(input);
          expect(template).toHaveBeenCalledWith(invalidCharacters);
        },
      );

      it("always reports at least one invalid character when failing", () => {
        assert(
          property(arbitraryString({ unit: "grapheme" }), (input) => {
            const result = datatypeC.customize({
              invalidCharacters: (characters) => [...characters].join(""),
            })(input);

            return result.issues === undefined || result.issues.length > 0; // oxlint-disable-line no-conditional-in-test -- seems not fixable
          }),
        );
      });
    });

    describe("compile-time parsing", () => {
      it("is predetermined to succeed for an empty string", () => {
        expectTypeOf(datatypeC("")).toEqualTypeOf<SuccessResult<DatatypeC>>();
      });

      it("is predetermined to succeed for all N1-N4 characters", () => {
        expectTypeOf(
          datatypeC("Musterfirma GmbH\nAbteilung: IT\tInfo\r"),
        ).toEqualTypeOf<SuccessResult<DatatypeC>>();

        expectTypeOf(
          datatypeC("Text with fraction ¼ and currency symbol ¤"),
        ).toEqualTypeOf<SuccessResult<DatatypeC>>();

        expectTypeOf(
          datatypeC("Text containing a non-breaking space: \u00A0"),
        ).toEqualTypeOf<SuccessResult<DatatypeC>>();
      });

      it("remains undetermined for inputs outside the supported type-level character range", () => {
        expectTypeOf(datatypeC("Невский 15")).toEqualTypeOf<
          Result<DatatypeC>
        >();
        expectTypeOf(datatypeC("Müller")).toEqualTypeOf<Result<DatatypeC>>();
      });

      it("remains undetermined for non-static string literals", () => {
        const dynamicInput = String.raw`Hello World`;
        expectTypeOf(datatypeC(dynamicInput)).toEqualTypeOf<
          Result<DatatypeC>
        >();
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
      expect(DATATYPE_C_PATTERN).toMatchInlineSnapshot(
        `/\\^\\(\\?:\\[\\\\u0009-\\\\u000A\\]\\|\\\\u000D\\|\\[\\\\u0020-\\\\u007E\\]\\|\\[\\\\u00A0-\\\\u00AC\\]\\|\\[\\\\u00AE-\\\\u017E\\]\\|\\[\\\\u0187-\\\\u0188\\]\\|\\\\u018F\\|\\\\u0197\\|\\[\\\\u01A0-\\\\u01A1\\]\\|\\[\\\\u01AF-\\\\u01B0\\]\\|\\\\u01B7\\|\\[\\\\u01CD-\\\\u01DC\\]\\|\\[\\\\u01DE-\\\\u01DF\\]\\|\\[\\\\u01E2-\\\\u01F0\\]\\|\\[\\\\u01F4-\\\\u01F5\\]\\|\\[\\\\u01F8-\\\\u01FF\\]\\|\\[\\\\u0212-\\\\u0213\\]\\|\\[\\\\u0218-\\\\u021B\\]\\|\\[\\\\u021E-\\\\u021F\\]\\|\\[\\\\u0227-\\\\u0233\\]\\|\\\\u0259\\|\\\\u0268\\|\\\\u0292\\|\\[\\\\u02B9-\\\\u02BA\\]\\|\\[\\\\u02BE-\\\\u02BF\\]\\|\\\\u02C8\\|\\\\u02CC\\|\\[\\\\u1E02-\\\\u1E03\\]\\|\\[\\\\u1E06-\\\\u1E07\\]\\|\\[\\\\u1E0A-\\\\u1E11\\]\\|\\\\u1E17\\|\\[\\\\u1E1C-\\\\u1E2B\\]\\|\\[\\\\u1E2F-\\\\u1E37\\]\\|\\[\\\\u1E3A-\\\\u1E3B\\]\\|\\[\\\\u1E40-\\\\u1E49\\]\\|\\[\\\\u1E52-\\\\u1E5B\\]\\|\\[\\\\u1E5E-\\\\u1E63\\]\\|\\[\\\\u1E6A-\\\\u1E6F\\]\\|\\[\\\\u1E80-\\\\u1E87\\]\\|\\[\\\\u1E8C-\\\\u1E97\\]\\|\\\\u1E9E\\|\\[\\\\u1EA0-\\\\u1EF9\\]\\|\\\\u2019\\|\\\\u2021\\|\\\\u20AC\\|\\\\u0041\\\\u030B\\|\\\\u0043\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0044\\\\u0302\\|\\\\u0046\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0047\\\\u0300\\|\\\\u0048\\(\\?:\\\\u0304\\|\\\\u0326\\|\\\\u0331\\)\\|\\\\u004A\\(\\?:\\\\u0301\\|\\\\u030C\\)\\|\\\\u004B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0048\\|\\\\u035F\\\\u0068\\)\\|\\\\u004C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u004D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u004E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0050\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0052\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0053\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0054\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0308\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0055\\\\u0307\\|\\\\u005A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u0061\\\\u030B\\|\\\\u0063\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0064\\\\u0302\\|\\\\u0066\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0067\\\\u0300\\|\\\\u0068\\(\\?:\\\\u0304\\|\\\\u0326\\)\\|\\\\u006A\\\\u0301\\|\\\\u006B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0068\\)\\|\\\\u006C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u006D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u006E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0070\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0072\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0073\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0074\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0075\\\\u0307\\|\\\\u007A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u00C7\\\\u0306\\|\\\\u00DB\\\\u0304\\|\\\\u00E7\\\\u0306\\|\\\\u00FB\\\\u0304\\|\\\\u00FF\\\\u0301\\|\\\\u010C\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u010D\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u0113\\\\u030D\\|\\\\u012A\\\\u0301\\|\\\\u012B\\\\u0301\\|\\\\u014D\\\\u030D\\|\\\\u017D\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u017E\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u1E32\\\\u0304\\|\\\\u1E33\\\\u0304\\|\\\\u1E62\\\\u0304\\|\\\\u1E63\\\\u0304\\|\\\\u1E6C\\\\u0304\\|\\\\u1E6D\\\\u0304\\|\\\\u1EA0\\\\u0308\\|\\\\u1EA1\\\\u0308\\|\\\\u1ECC\\\\u0308\\|\\\\u1ECD\\\\u0308\\|\\\\u1EE4\\(\\?:\\\\u0304\\|\\\\u0308\\)\\|\\\\u1EE5\\(\\?:\\\\u0304\\|\\\\u0308\\)\\)\\*\\$/u`,
      );
    });
  });
}
