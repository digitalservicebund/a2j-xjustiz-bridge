import {
  type FailureResult,
  type IsLiteral,
  type LiteralAwareResult,
  type RefinedTypeFactory, // oxlint-disable-line no-unused-vars -- referenced by TSDoc
  type Result,
  type SuccessResult,
  defineRefinedType,
  isNumber,
} from "~/xjustiz-schemata/shared-kernel/refined-types";
import { type DeepLiteralToPrimitive } from "~/metatypes";

declare const TAG: unique symbol;

/**
 * Built-in datatype `xs:decimal` defined by the specification for the W3C XML
 * Schema Definition Language (XSD) 1.1 Part 2: Datatypes.
 *
 * Represents the mathematical concept of decimal numbers (real numbers that
 * can be represented by decimal numerals).
 * See the related {@link decimal | refined type factory} for construction.
 */
/*
 * Internal notes
 *
 * **Lexical Space vs. JavaScript Primitives:**
 *
 * In XML text documents, the lexical representation of `xs:decimal` strictly permits
 * only plain decimal notation matching the regular expression:
 * `(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)`
 * Scientific exponent notation (`1e3`) and alternative bases (`0x1A`) are strictly
 * forbidden in raw XML decimal text.
 *
 * In this library, the scalar represents JavaScript `number` primitive values.
 * Any JavaScript numeric literal notation passed to the constructor is evaluated
 * by the JavaScript runtime into an IEEE 754 finite number prior to validation.
 *
 */
export type Decimal = number & {
  readonly [TAG]: "Use the `decimal` factory to construct valid instances";
};

function parseDecimal(
  issueMessages: DecimalIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  // oxlint-disable-next-line no-unsafe-type-assertion -- necessary "trick" for compile-time parsing
  return function parse(input: number): Result<Decimal> {
    return Number.isFinite(input)
      ? { value: input as unknown as Decimal } // oxlint-disable-line no-unsafe-type-assertion -- explicit cast "trick" for branding
      : { issues: [{ message: issueMessages.notFinite }] };
  } as <Value extends number>(
    input: Value,
  ) => LiteralAwareResult<number, Value, ParseDecimal<Value>, Decimal>;
}

const DEFAULT_ISSUE_MESSAGES = {
  notFinite: "Input is not a finite number",
} as const;

type DecimalIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParseDecimal<Value extends number> =
  IsLiteral<Value, number> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : SuccessResult<Decimal>;

/**
 * Factory function object for the {@link Decimal} refined type. See
 * {@link RefinedTypeFactory} for further details, usage examples, and
 * customization.
 *
 * Supports compile-time parsing for numeric literal types. Inputs that
 * TypeScript widens to `number` remain undetermined until runtime, where
 * non-finite values fail validation.
 *
 * @example
 * ```typescript
 * decimal(12.34).value; // success (compile-time parsing)
 * decimal(-0.5).value; // success (compile-time parsing)
 * const someResult = decimal(someDynamicInput); // always undetermined
 * const mySchema = someSchemaLibrary({ amount: decimal }); // via Standard Schema
 * ```
 */
export const decimal = defineRefinedType(isNumber, parseDecimal);

if (import.meta.vitest) {
  const { describe, it, test, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function -- normal describe block
  describe("decimal", async () => {
    const {
      assert,
      property,
      double: arbitraryDouble,
      constantFrom,
    } = await import("fast-check");

    describe("runtime parsing", () => {
      it("fails for NaN", () => {
        expect(decimal(NaN)).toStrictEqual({
          issues: [{ message: "Input is not a finite number" }],
        });
      });

      it("fails for Infinity", () => {
        expect(decimal(Infinity)).toStrictEqual({
          issues: [{ message: "Input is not a finite number" }],
        });
      });

      it("fails for -Infinity", () => {
        expect(decimal(-Infinity)).toStrictEqual({
          issues: [{ message: "Input is not a finite number" }],
        });
      });

      it("succeeds for finite double floating point inputs", () => {
        assert(
          property(
            arbitraryDouble({ noNaN: true, noDefaultInfinity: true }),
            (input) => {
              expect(decimal(input)).toStrictEqual({ value: input });
            },
          ),
        );
      });

      it("fails for non-finite numbers", () => {
        assert(
          property(constantFrom(NaN, Infinity, -Infinity), (input) => {
            expect(decimal(input)).toStrictEqual({
              issues: [{ message: "Input is not a finite number" }],
            });
          }),
        );
      });

      it("supports custom issue messages", () => {
        const customDecimal = decimal.customize({
          notFinite: "Value must be a finite number",
        });

        expect(customDecimal(NaN)).toEqual({
          issues: [{ message: "Value must be a finite number" }],
        });
      });
    });

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("compile-time parsing", () => {
      // oxlint-disable-next-line max-lines-per-function -- normal describe block
      describe("is predetermined to succeed for finite JavaScript numeric literals", () => {
        test("using plain decimal notation", () => {
          expectTypeOf(decimal(1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(123.456)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();

          expectTypeOf(decimal(-42.1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(0)).toEqualTypeOf<SuccessResult<Decimal>>();
        });

        test("using JavaScript exponent syntax", () => {
          expectTypeOf(decimal(1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(1.5e3)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(-9.99e-2)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();
        });

        test("using JavaScript hexadecimal literals", () => {
          expectTypeOf(decimal(0x1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(0x3_e7)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(-0x1a)).toEqualTypeOf<SuccessResult<Decimal>>();
        });

        test("using JavaScript octal literals", () => {
          expectTypeOf(decimal(0o1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(0o1747)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(-0o755)).toEqualTypeOf<SuccessResult<Decimal>>();
        });

        test("using JavaScript binary literals", () => {
          expectTypeOf(decimal(0b1)).toEqualTypeOf<SuccessResult<Decimal>>();

          expectTypeOf(decimal(0b11_1110_0111)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();

          expectTypeOf(decimal(-0b1010)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();
        });

        test("max and min safe integer", () => {
          // Literal value of `Number.MAX_SAFE_INTEGER`
          expectTypeOf(decimal(9_007_199_254_740_991)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();

          // Literal value of `Number.MIN_SAFE_INTEGER`
          expectTypeOf(decimal(-9_007_199_254_740_991)).toEqualTypeOf<
            SuccessResult<Decimal>
          >();
        });
      });

      it("remains undetermined for Infinity", () => {
        expectTypeOf(decimal(Infinity)).toEqualTypeOf<Result<Decimal>>();
      });

      it("remains undetermined for -Infinity", () => {
        expectTypeOf(decimal(-Infinity)).toEqualTypeOf<Result<Decimal>>();
      });

      it("remains undetermined for NaN", () => {
        expectTypeOf(decimal(NaN)).toEqualTypeOf<Result<Decimal>>();
      });
    });
  });
}
