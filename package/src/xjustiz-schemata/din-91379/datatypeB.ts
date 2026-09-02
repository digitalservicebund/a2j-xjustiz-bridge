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
} from "./schriftzeichengruppe";
import { type DatatypeA } from "./datatypeA"; // oxlint-disable-line no-unused-vars -- referenced by TSDoc
import { findInvalidCharacters } from "./unicode";
import { transformXsdPatternToJavaScriptExpression } from "~/xjustiz-schemata/xml-schema-definition/restriction-pattern";

declare const TAG: unique symbol;

/**
 * Datatype B of the DIN 91379 norm. A string with restricted character set.
 *
 * This is an extension of {@link DatatypeA}, meant to be used for address
 * related scalars like street name, house number, names of cities, and legal
 * entities like companies. That includes all Latin characters, plus additional
 * non-letters of the groups N1 and N2 ("Nicht-Buchstaben N1 und N2").
 *
 * See the related {@link datatypeB | refined type factory} for construction.
 *
 * Available operations that maintain the type:
 *   - {@link join}
 */
export type DatatypeB = string & {
  readonly [TAG]: "Use the `datatypeB` factory to construct valid instances.";
};

function parseDatatypeB(
  issueMessages: DatatypeBIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  return function parse(input: string): Result<DatatypeB> {
    const composedUnicodeInput = input.normalize("NFC");

    if (DATATYPE_B_PATTERN.test(composedUnicodeInput)) {
      // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
      return { value: composedUnicodeInput as unknown as DatatypeB };

      // oxlint-disable-next-line no-else-return -- false positive
    } else {
      const characters = findInvalidCharacters(
        composedUnicodeInput,
        DATATYPE_B_PATTERN,
      );

      return {
        issues: [{ message: issueMessages.invalidCharacters(characters) }],
      };
    }
  } as <Value extends string>(
    input: Value,
  ) => LiteralAwareResult<string, Value, ParseDatatypeB<Value>, DatatypeB>;
}

const DEFAULT_ISSUE_MESSAGES = {
  /**
   * @param characters - graphemes as phoneme units in composed Unicode format
   */
  invalidCharacters: (characters: Readonly<Set<string>>) =>
    `Contains characters not allowed by DIN 91379 Datentyp B: ${[...characters].map((character) => `'${character}'`).join(", ")}`,
} as const;

type DatatypeBIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParseDatatypeB<Value extends string> =
  IsLiteral<Value, string> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : ConsumeCharactersFrom<Value, DatatypeBCharacterIncomplete> extends ""
      ? SuccessResult<DatatypeB>
      : Result<DatatypeB>;

/**
 * Factory function object fro the {@link DatatypeB} refined type. See
 * {@link RefinedTypeFactory} for further details, usage examples, and
 * customization.
 *
 * Support for partial compile-time parsing of static string literals. Only
 * a subset of the full character set that is tested at runtime is supported.
 * This includes the full ASCII range, which is allowed. Primarily, multi code
 * point Unicode sequences are excluded. For static string literals with
 * characters outside the supported range, the result stays undetermined and
 * compile-time evaluation is necessary.
 *
 * @example
 * ```typescript
 * datatypeB("Unter den Linden 6").value; // success (compile-time parsing)
 * const someResult = datatypeB("116 avenue des Champs-Élysées"); // undetermined
 * const otherResult = datatypeB(someDynamicInput); // always undetermined
 * const mySchema = someSchemaLibrary({ street: datatypeB }); // via Standard Schema
 * ```
 */
export const datatypeB = defineRefinedType(isString, parseDatatypeB);

/**
 * Adapted version of the default {@link Array.prototype.join} operation that
 * maintains the invariants of {@link DatatypeB}.
 *
 * @example
 * ```typescript
 * const fullAddress = join(
 *   datatypeB(" ").value,
 *   datatypeB("Musterstraße").value,
 *   datatypeB("1A").value,
 *   datatypeB("Musterstadt").value,
 * );
 * // "Musterstraße 1A Musterstadt" - still DatatypeB no plain string
 * ```
 */
export function join(
  separator: DatatypeB,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- false positive
  ...segments: readonly DatatypeB[]
): DatatypeB {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return segments.join(separator) as unknown as DatatypeB;
}

/*
 * This is the original restriction pattern in the XML schema definition (XSD) of
 * DIN 91379 as delivered in the XJustiz specification bundle.
 *
 * The pattern was authored with prioritizing the pre-composed Unicode format
 * where available. This means strings in decomposed Unicode format must first be
 * composed before the pattern can match properly.
 */
const ORIGINAL_XSD_PATTERN = String.raw`([&#x0020;-&#x007E;]|[&#x00A1;-&#x00A3;]|&#x00A5;|[&#x00A7;-&#x00AC;]|[&#x00AE;-&#x00B7;]|[&#x00B9;-&#x00BB;]|[&#x00BF;-&#x017E;]|[&#x0187;-&#x0188;]|&#x018F;|&#x0197;|[&#x01A0;-&#x01A1;]|[&#x01AF;-&#x01B0;]|&#x01B7;|[&#x01CD;-&#x01DC;]|[&#x01DE;-&#x01DF;]|[&#x01E2;-&#x01F0;]|[&#x01F4;-&#x01F5;]|[&#x01F8;-&#x01FF;]|[&#x0212;-&#x0213;]|[&#x0218;-&#x021B;]|[&#x021E;-&#x021F;]|[&#x0227;-&#x0233;]|&#x0259;|&#x0268;|&#x0292;|[&#x02B9;-&#x02BA;]|[&#x02BE;-&#x02BF;]|&#x02C8;|&#x02CC;|[&#x1E02;-&#x1E03;]|[&#x1E06;-&#x1E07;]|[&#x1E0A;-&#x1E11;]|&#x1E17;|[&#x1E1C;-&#x1E2B;]|[&#x1E2F;-&#x1E37;]|[&#x1E3A;-&#x1E3B;]|[&#x1E40;-&#x1E49;]|[&#x1E52;-&#x1E5B;]|[&#x1E5E;-&#x1E63;]|[&#x1E6A;-&#x1E6F;]|[&#x1E80;-&#x1E87;]|[&#x1E8C;-&#x1E97;]|&#x1E9E;|[&#x1EA0;-&#x1EF9;]|&#x2019;|&#x2021;|&#x20AC;|&#x0041;&#x030B;|&#x0043;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0044;&#x0302;|&#x0046;(&#x0300;|&#x0304;)|&#x0047;&#x0300;|&#x0048;(&#x0304;|&#x0326;|&#x0331;)|&#x004A;(&#x0301;|&#x030C;)|&#x004B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0048;|&#x035F;&#x0068;)|&#x004C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x004D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x004E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0050;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0052;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0053;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0054;(&#x0300;|&#x0304;|&#x0308;|&#x0315;|&#x031B;)|&#x0055;&#x0307;|&#x005A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x0061;&#x030B;|&#x0063;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0315;|&#x0323;|&#x0326;|&#x0328;&#x0306;)|&#x0064;&#x0302;|&#x0066;(&#x0300;|&#x0304;)|&#x0067;&#x0300;|&#x0068;(&#x0304;|&#x0326;)|&#x006A;&#x0301;|&#x006B;(&#x0300;|&#x0302;|&#x0304;|&#x0307;|&#x0315;|&#x031B;|&#x0326;|&#x035F;&#x0068;)|&#x006C;(&#x0302;|&#x0325;|&#x0325;&#x0304;|&#x0326;)|&#x006D;(&#x0300;|&#x0302;|&#x0306;|&#x0310;)|&#x006E;(&#x0302;|&#x0304;|&#x0306;|&#x0326;)|&#x0070;(&#x0300;|&#x0304;|&#x0315;|&#x0323;)|&#x0072;(&#x0306;|&#x0325;|&#x0325;&#x0304;)|&#x0073;(&#x0300;|&#x0304;|&#x031B;&#x0304;|&#x0331;)|&#x0074;(&#x0300;|&#x0304;|&#x0315;|&#x031B;)|&#x0075;&#x0307;|&#x007A;(&#x0300;|&#x0304;|&#x0306;|&#x0308;|&#x0327;)|&#x00C7;&#x0306;|&#x00DB;&#x0304;|&#x00E7;&#x0306;|&#x00FB;&#x0304;|&#x00FF;&#x0301;|&#x010C;(&#x0315;|&#x0323;)|&#x010D;(&#x0315;|&#x0323;)|&#x0113;&#x030D;|&#x012A;&#x0301;|&#x012B;&#x0301;|&#x014D;&#x030D;|&#x017D;(&#x0326;|&#x0327;)|&#x017E;(&#x0326;|&#x0327;)|&#x1E32;&#x0304;|&#x1E33;&#x0304;|&#x1E62;&#x0304;|&#x1E63;&#x0304;|&#x1E6C;&#x0304;|&#x1E6D;&#x0304;|&#x1EA0;&#x0308;|&#x1EA1;&#x0308;|&#x1ECC;&#x0308;|&#x1ECD;&#x0308;|&#x1EE4;(&#x0304;|&#x0308;)|&#x1EE5;(&#x0304;|&#x0308;))*`;

const DATATYPE_B_PATTERN =
  transformXsdPatternToJavaScriptExpression(ORIGINAL_XSD_PATTERN);

type DatatypeBCharacterIncomplete =
  | LateinischeBuchstabenIncomplete
  | NichtBuchstabenN1
  | NichtBuchstabenN2;

if (import.meta.vitest) {
  const { describe, it, test, expect, expectTypeOf, vi } = import.meta.vitest;

  /*
   * We don't try to test the original, copy-pasted pattern throughout, but
   * primarily focus on the implementation as refined type. Though we use an
   * extensive list of diverse real world examples. The pattern transformation
   * requires extra attention, protected by test.
   */
  // oxlint-disable-next-line max-lines-per-function -- normal describe block
  describe("Datatype B", async () => {
    const {
      assert,
      property,
      string: arbitraryString,
      array: arbitraryArray,
    } = await import("fast-check");

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("runtime parsing", () => {
      it("is successful for an empty string", () => {
        expect(datatypeB("")).toStrictEqual({ value: "" });
      });

      it("is successful for international address foo examples", () => {
        expect(datatypeB("70 avenue des Champs-Élysées")).toStrictEqual({
          value: "70 avenue des Champs-Élysées",
        });
      });

      test.each([
        "Unter den Linden 6",
        "116 avenue des Champs-Élysées",
        "Königsallee 14",
        "Passeig de Gràcia 43",
        "Václavské náměstí 1",
        "Nørrebrogade 13",
        "ul. Marszałkowska 3/5",
        "Þingvallavegur 15",
        "Rruga Ismail Qemali 5",
        "Şişli Meydanı 7",
        "Avenida da Liberdade 185",
        "§ 21a Musterstraße",
        "14a",
        "14/2",
        "42 bis",
        "Nr. 42",
        "Bâtiment C, Appartement 12",
        "3B (2. Etage)",
        "2ème étage",
        "p/a Musterstraße 42",
        "München",
        "ŁódźŁ",
        "Reykjavík",
        "Ålesund",
        "Brașovș",
        "São Pauloã",
        "Montréal",
        "Genève",
        "Cluj-Napoca",
        "75008",
        "SW1A 2A",
        "CH-8001",
        "NL-1234 AB",
        "EC1A 1BB",
        "Société Générale S.A.",
        "LVMH Moët Hennessy Louis Vuitton SE",
        "L'Oréal S.A.",
        "Volkswagen GmbH & Co. KG",
        "Škoda Auto a.s",
        "Ørsted A/S",
        "Nestlé S.A.",
        "Bäcker & Söhne OHG",
        "Price & Co. (Holdings) Ltd.",
        "Đuro Đaković d.d.",
        "ACME® Corporation",
        "© Springer Nature GmbH",
        "Preis: 150 €",
        "£150 per sq ft",
        "¥ 10.000¥",
      ])(
        "is successful for international address related examples: '%s'",
        (input) => {
          expect(datatypeB(input)).toStrictEqual({ value: input });
        },
      );

      test.each<
        Readonly<{ input: string; invalidCharacters: Readonly<Set<string>> }>
      >([
        { input: "12–14 Main", invalidCharacters: new Set(["–"]) },
        { input: "221½ Baker", invalidCharacters: new Set(["½"]) },
        { input: "ACME™ House", invalidCharacters: new Set(["™"]) },
        {
          input: "Невский 15",
          invalidCharacters: new Set(["Н", "е", "в", "с", "к", "и", "й"]),
        },
        {
          input: "Ερμού 9",
          invalidCharacters: new Set(["Ε", "ρ", "μ", "ο", "ύ"]),
        },
        { input: "3 םולש", invalidCharacters: new Set(["ם", "ו", "ל", "ש"]) },
      ])(
        "fails for non romanized transliterations for international inputs",
        ({ input, invalidCharacters }) => {
          const template = vi.fn();
          datatypeB.customize({ invalidCharacters: template })(input);
          expect(template).toHaveBeenCalledWith(invalidCharacters);
        },
      );

      it("always reports at least one invalid character when failing", () => {
        assert(
          property(arbitraryString({ unit: "grapheme" }), (input) => {
            const result = datatypeB.customize({
              invalidCharacters: (characters) => [...characters].join(""),
            })(input);

            return result.issues === undefined || result.issues.length > 0; // oxlint-disable-line no-conditional-in-test -- seems not fixable
          }),
        );
      });
    });

    describe("compile-time parsing", () => {
      it("is predetermined to succeed for an empty string", () => {
        expectTypeOf(datatypeB("")).toEqualTypeOf<SuccessResult<DatatypeB>>();
      });

      it("is predetermined to succeed for full ASCII range and Nicht-Buchstaben N1 and N2", () => {
        expectTypeOf(datatypeB("Unter den Linden 6")).toEqualTypeOf<
          SuccessResult<DatatypeB>
        >();

        expectTypeOf(datatypeB("NL-1234 AB")).toEqualTypeOf<
          SuccessResult<DatatypeB>
        >();

        expectTypeOf(datatypeB(" ',-.`~¨´·ʹʺʾʿˈˌ’‡")).toEqualTypeOf<
          SuccessResult<DatatypeB>
        >();

        expectTypeOf(
          datatypeB(
            '!"#$%&()*+/0123456789:;<=>?@[ ]^_{|}¡¢£¥§©ª«¬®¯°±²³μ¶¹º»¿×÷€',
          ),
        ).toEqualTypeOf<SuccessResult<DatatypeB>>();
      });

      it("remains undetermined for valid and invalid inputs outside the supported range of Lateinische Buchstaben", () => {
        expectTypeOf(datatypeB("116 avenue des Champs-Élysées")).toEqualTypeOf<
          Result<DatatypeB>
        >();

        expectTypeOf(datatypeB("Невский 15")).toEqualTypeOf<
          Result<DatatypeB>
        >();
      });

      it("remains undetermined for non static string literals", () => {
        const dynamicInput = String.raw`Unter den Linden 6`;
        expectTypeOf(datatypeB(dynamicInput)).toEqualTypeOf<
          Result<DatatypeB>
        >();
      });
    });

    describe("join", () => {
      it("correctly joins all segments with the given seperator", () => {
        const output = join(
          datatypeB(" ").value,
          datatypeB("Musterstraße").value,
          datatypeB("1A").value,
          datatypeB("Musterstadt").value,
        );
        expect(output).toEqual("Musterstraße 1A Musterstadt");
      });

      it("produces only valid DatatypeB outputs that could be parsed again", () => {
        assert(
          property(
            arbitraryDatatypeB(),
            arbitraryArray(arbitraryDatatypeB()),
            (separator, segments) => {
              const output = join(separator, ...segments);
              expect(datatypeB(output)).toStrictEqual({ value: output });
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
      expect(DATATYPE_B_PATTERN).toMatchInlineSnapshot(
        `/\\^\\(\\?:\\[\\\\u0020-\\\\u007E\\]\\|\\[\\\\u00A1-\\\\u00A3\\]\\|\\\\u00A5\\|\\[\\\\u00A7-\\\\u00AC\\]\\|\\[\\\\u00AE-\\\\u00B7\\]\\|\\[\\\\u00B9-\\\\u00BB\\]\\|\\[\\\\u00BF-\\\\u017E\\]\\|\\[\\\\u0187-\\\\u0188\\]\\|\\\\u018F\\|\\\\u0197\\|\\[\\\\u01A0-\\\\u01A1\\]\\|\\[\\\\u01AF-\\\\u01B0\\]\\|\\\\u01B7\\|\\[\\\\u01CD-\\\\u01DC\\]\\|\\[\\\\u01DE-\\\\u01DF\\]\\|\\[\\\\u01E2-\\\\u01F0\\]\\|\\[\\\\u01F4-\\\\u01F5\\]\\|\\[\\\\u01F8-\\\\u01FF\\]\\|\\[\\\\u0212-\\\\u0213\\]\\|\\[\\\\u0218-\\\\u021B\\]\\|\\[\\\\u021E-\\\\u021F\\]\\|\\[\\\\u0227-\\\\u0233\\]\\|\\\\u0259\\|\\\\u0268\\|\\\\u0292\\|\\[\\\\u02B9-\\\\u02BA\\]\\|\\[\\\\u02BE-\\\\u02BF\\]\\|\\\\u02C8\\|\\\\u02CC\\|\\[\\\\u1E02-\\\\u1E03\\]\\|\\[\\\\u1E06-\\\\u1E07\\]\\|\\[\\\\u1E0A-\\\\u1E11\\]\\|\\\\u1E17\\|\\[\\\\u1E1C-\\\\u1E2B\\]\\|\\[\\\\u1E2F-\\\\u1E37\\]\\|\\[\\\\u1E3A-\\\\u1E3B\\]\\|\\[\\\\u1E40-\\\\u1E49\\]\\|\\[\\\\u1E52-\\\\u1E5B\\]\\|\\[\\\\u1E5E-\\\\u1E63\\]\\|\\[\\\\u1E6A-\\\\u1E6F\\]\\|\\[\\\\u1E80-\\\\u1E87\\]\\|\\[\\\\u1E8C-\\\\u1E97\\]\\|\\\\u1E9E\\|\\[\\\\u1EA0-\\\\u1EF9\\]\\|\\\\u2019\\|\\\\u2021\\|\\\\u20AC\\|\\\\u0041\\\\u030B\\|\\\\u0043\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0044\\\\u0302\\|\\\\u0046\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0047\\\\u0300\\|\\\\u0048\\(\\?:\\\\u0304\\|\\\\u0326\\|\\\\u0331\\)\\|\\\\u004A\\(\\?:\\\\u0301\\|\\\\u030C\\)\\|\\\\u004B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0048\\|\\\\u035F\\\\u0068\\)\\|\\\\u004C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u004D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u004E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0050\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0052\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0053\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0054\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0308\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0055\\\\u0307\\|\\\\u005A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u0061\\\\u030B\\|\\\\u0063\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0315\\|\\\\u0323\\|\\\\u0326\\|\\\\u0328\\\\u0306\\)\\|\\\\u0064\\\\u0302\\|\\\\u0066\\(\\?:\\\\u0300\\|\\\\u0304\\)\\|\\\\u0067\\\\u0300\\|\\\\u0068\\(\\?:\\\\u0304\\|\\\\u0326\\)\\|\\\\u006A\\\\u0301\\|\\\\u006B\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0304\\|\\\\u0307\\|\\\\u0315\\|\\\\u031B\\|\\\\u0326\\|\\\\u035F\\\\u0068\\)\\|\\\\u006C\\(\\?:\\\\u0302\\|\\\\u0325\\|\\\\u0325\\\\u0304\\|\\\\u0326\\)\\|\\\\u006D\\(\\?:\\\\u0300\\|\\\\u0302\\|\\\\u0306\\|\\\\u0310\\)\\|\\\\u006E\\(\\?:\\\\u0302\\|\\\\u0304\\|\\\\u0306\\|\\\\u0326\\)\\|\\\\u0070\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u0323\\)\\|\\\\u0072\\(\\?:\\\\u0306\\|\\\\u0325\\|\\\\u0325\\\\u0304\\)\\|\\\\u0073\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u031B\\\\u0304\\|\\\\u0331\\)\\|\\\\u0074\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0315\\|\\\\u031B\\)\\|\\\\u0075\\\\u0307\\|\\\\u007A\\(\\?:\\\\u0300\\|\\\\u0304\\|\\\\u0306\\|\\\\u0308\\|\\\\u0327\\)\\|\\\\u00C7\\\\u0306\\|\\\\u00DB\\\\u0304\\|\\\\u00E7\\\\u0306\\|\\\\u00FB\\\\u0304\\|\\\\u00FF\\\\u0301\\|\\\\u010C\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u010D\\(\\?:\\\\u0315\\|\\\\u0323\\)\\|\\\\u0113\\\\u030D\\|\\\\u012A\\\\u0301\\|\\\\u012B\\\\u0301\\|\\\\u014D\\\\u030D\\|\\\\u017D\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u017E\\(\\?:\\\\u0326\\|\\\\u0327\\)\\|\\\\u1E32\\\\u0304\\|\\\\u1E33\\\\u0304\\|\\\\u1E62\\\\u0304\\|\\\\u1E63\\\\u0304\\|\\\\u1E6C\\\\u0304\\|\\\\u1E6D\\\\u0304\\|\\\\u1EA0\\\\u0308\\|\\\\u1EA1\\\\u0308\\|\\\\u1ECC\\\\u0308\\|\\\\u1ECD\\\\u0308\\|\\\\u1EE4\\(\\?:\\\\u0304\\|\\\\u0308\\)\\|\\\\u1EE5\\(\\?:\\\\u0304\\|\\\\u0308\\)\\)\\*\\$/u`,
      );
    });

    function arbitraryDatatypeB() {
      return arbitraryString({ unit: "grapheme" })
        .map((input) => datatypeB(input))
        .filter((result) => result.issues === undefined)
        .map((result) => result.value);
    }
  });
}
