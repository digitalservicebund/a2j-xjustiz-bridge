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
 * Built-in datatype `xs:positiveInteger` defined by the specification for the
 * W3C XML Schema Definition Language (XSD) 1.1 Part 2: Datatypes. A restricted
 * number type.
 *
 * Represents the mathematical concept of positive integer numbers with finite
 * set (`{1,2,...}`).
 *
 * See the related {@link positiveInteger | refined type factory} for construction.
 *
 * Available operations that maintain the type:
 *   - {@link increment}
 */
export type PositiveInteger = number & {
  readonly [TAG]: "Use the `positiveInteger` factory to construct valid instances";
};

function parsePositiveInteger(
  issueMessages: PositiveIntegerIssueMessages = DEFAULT_ISSUE_MESSAGES,
) {
  // oxlint-disable-next-line no-unsafe-type-assertion -- necessary "trick" for compile-time parsing
  return function parse(input: number): Result<PositiveInteger> {
    if (!Number.isInteger(input)) {
      return { issues: [{ message: issueMessages.noInteger }] };
    } else if (input < 1) {
      return { issues: [{ message: issueMessages.notPositive }] };
      // oxlint-disable-next-line no-else-return -- false positive
    } else {
      // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
      return { value: input as unknown as PositiveInteger };
    }
  } as <Value extends number>(
    input: Value,
  ) => LiteralAwareResult<
    number,
    Value,
    ParsePositiveInteger<Value>,
    PositiveInteger
  >;
}

const DEFAULT_ISSUE_MESSAGES = {
  noInteger: "Input is not an integer",
  notPositive: "Input is not positive",
} as const;

type PositiveIntegerIssueMessages = DeepLiteralToPrimitive<
  typeof DEFAULT_ISSUE_MESSAGES
>;

type ParsePositiveInteger<Value extends number> =
  IsLiteral<Value, number> extends false
    ? FailureResult<"compile-time parsing only works for static literals">
    : `${Value}` extends `${string}.${string}`
      ? FailureResult<typeof DEFAULT_ISSUE_MESSAGES.noInteger>
      : `${Value}` extends `${string}e-${string}`
        ? FailureResult<typeof DEFAULT_ISSUE_MESSAGES.noInteger>
        : `${Value}` extends `-${string}`
          ? FailureResult<typeof DEFAULT_ISSUE_MESSAGES.notPositive>
          : Value extends 0
            ? FailureResult<typeof DEFAULT_ISSUE_MESSAGES.notPositive>
            : SuccessResult<PositiveInteger>;

/**
 * Factory function object for the {@link PositiveInteger} refined type.See
 * {@link RefinedTypeFactory} for further details, usage examples, and
 * customization.
 *
 * Support for compile-time parsing. Various notations like with exponent,
 * hexagonal, octal, and binary are all possible. Though, limited by some literal
 * numbers the TypeScript compiler always infers as plain numbers. Such include
 * `Infinity`, `-Infinity`, and `NaN`, all no valid positive integers.
 *
 * @example
 * ```typescript
 * positiveInteger(1).value; // success (compile-time parsing)
 * positiveInteger(0).value; // failure - inaccessible (compile-time parsing)
 * const someResult = positiveInteger(someDynamicInput) // always undetermined
 * const mySchema = someSchemaLibrary({ alter: positiveInteger }) // via Standard Schema
 * ```
 */
export const positiveInteger = defineRefinedType(
  isNumber,
  parsePositiveInteger,
);

/**
 * Increment {@link PositiveInteger} by one, while maintaining the invariants of
 * the type.
 *
 * @example
 * ```typescript
 * const output = increment(positiveInteger(2).value);
 * // 3 - still PositiveInteger no plain number
 * ```
 */
export function increment(operand: PositiveInteger): PositiveInteger {
  // oxlint-disable-next-line no-unsafe-type-assertion -- explicit assertion for branding
  return (operand + 1) as unknown as PositiveInteger;
}

if (import.meta.vitest) {
  const { describe, it, test, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function -- normal describe block
  describe("positive integer", async () => {
    const {
      assert,
      property,
      integer: arbitraryInteger,
      double: arbitraryDouble,
    } = await import("fast-check");

    describe("runtime parsing", () => {
      it("fails for number zero", () => {
        expect(positiveInteger(0)).toStrictEqual({
          issues: [{ message: "Input is not positive" }],
        });
      });

      it("fails for infinity", () => {
        expect(positiveInteger(Infinity)).toStrictEqual({
          issues: [{ message: "Input is not an integer" }],
        });
      });

      it("succeeds for integers greater than zero", () => {
        assert(
          property(arbitraryInteger({ min: 1 }), (input) => {
            expect(positiveInteger(input)).toStrictEqual({ value: input });
          }),
        );
      });

      it("fails for negative integers", () => {
        assert(
          property(arbitraryInteger({ max: 0 }), (input) => {
            expect(positiveInteger(input)).toStrictEqual({
              issues: [{ message: "Input is not positive" }],
            });
          }),
        );
      });

      it("fails for double floating point inputs", () => {
        assert(
          property(arbitraryDouble({ noInteger: true }), (input) => {
            expect(positiveInteger(input)).toStrictEqual({
              issues: [{ message: "Input is not an integer" }],
            });
          }),
        );
      });
    });

    // oxlint-disable-next-line max-lines-per-function -- normal describe block
    describe("compile-time parsing", () => {
      describe("is predetermined to fail for floating point values", () => {
        test("in decimal notation", () => {
          expectTypeOf(positiveInteger(0.1)).toEqualTypeOf<
            FailureResult<"Input is not an integer">
          >();

          expectTypeOf(positiveInteger(9.0003)).toEqualTypeOf<
            FailureResult<"Input is not an integer">
          >();
        });

        test("with exponent", () => {
          expectTypeOf(positiveInteger(1e-1)).toEqualTypeOf<
            FailureResult<"Input is not an integer">
          >();

          expectTypeOf(positiveInteger(1e-7)).toEqualTypeOf<
            FailureResult<"Input is not an integer">
          >();

          expectTypeOf(positiveInteger(1.5e-7)).toEqualTypeOf<
            FailureResult<"Input is not an integer">
          >();
        });
      });

      // oxlint-disable-next-line max-lines-per-function -- normal describe block
      describe("is predetermined to fail for negative inputs", () => {
        test("in decimal notation", () => {
          expectTypeOf(positiveInteger(-1)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();

          expectTypeOf(positiveInteger(-999)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("with exponent", () => {
          // prettier-ignore
          expectTypeOf(positiveInteger(-1e0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();

          expectTypeOf(positiveInteger(-9.99e2)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in hexadecimal notation", () => {
          expectTypeOf(positiveInteger(-0x1)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();

          expectTypeOf(positiveInteger(-0x3_e7)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in octal notation", () => {
          expectTypeOf(positiveInteger(-0o1)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();

          expectTypeOf(positiveInteger(-0o1747)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in binary notation", () => {
          expectTypeOf(positiveInteger(-0b1)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();

          expectTypeOf(positiveInteger(-0b11_1110_0111)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });
      });

      describe("is predetermined to fail for zero", () => {
        test("in decimal notation", () => {
          expectTypeOf(positiveInteger(0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("with exponent", () => {
          // prettier-ignore
          expectTypeOf(positiveInteger(0e0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in hexadecimal notation", () => {
          expectTypeOf(positiveInteger(0x0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in octal notation", () => {
          expectTypeOf(positiveInteger(0o0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });

        test("in binary notation", () => {
          expectTypeOf(positiveInteger(0b0)).toEqualTypeOf<
            FailureResult<"Input is not positive">
          >();
        });
      });

      // oxlint-disable-next-line max-lines-per-function -- normal describe block
      describe("is predetermined to succeed for positive integer literals", () => {
        test("in decimal notation", () => {
          expectTypeOf(positiveInteger(1)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();

          expectTypeOf(positiveInteger(999)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });

        test("with exponent", () => {
          // prettier-ignore
          expectTypeOf(positiveInteger(1e0)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();

          expectTypeOf(positiveInteger(9.99e2)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });

        test("in hexadecimal notation", () => {
          expectTypeOf(positiveInteger(0x1)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();

          expectTypeOf(positiveInteger(0x3_e7)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });

        test("in octal notation", () => {
          expectTypeOf(positiveInteger(0o1)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();

          expectTypeOf(positiveInteger(0o1747)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });

        test("in binary notation", () => {
          expectTypeOf(positiveInteger(0b1)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();

          expectTypeOf(positiveInteger(0b11_1110_0111)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });

        test("max safe integer", () => {
          // Literal value of `Number.MAX_SAFE_INTEGER`
          expectTypeOf(positiveInteger(9_007_199_254_740_991)).toEqualTypeOf<
            SuccessResult<PositiveInteger>
          >();
        });
      });

      it("remains undetermined for Infinity", () => {
        expectTypeOf(positiveInteger(Infinity)).toEqualTypeOf<
          Result<PositiveInteger>
        >();
      });

      it("remains undetermined for -Infinity", () => {
        expectTypeOf(positiveInteger(-Infinity)).toEqualTypeOf<
          Result<PositiveInteger>
        >();
      });

      it("remains undetermined for NaN", () => {
        expectTypeOf(positiveInteger(NaN)).toEqualTypeOf<
          Result<PositiveInteger>
        >();
      });
    });

    describe("incrementing", () => {
      it("increments the operand by one", () => {
        assert(
          property(arbitraryPositiveInteger(), (operand) => {
            expect(increment(operand)).toStrictEqual(operand + 1);
          }),
        );
      });

      it("produces only valid positive integers that could be parsed again", () => {
        assert(
          property(arbitraryPositiveInteger(), (operand) => {
            const output = increment(operand);
            expect(positiveInteger(output)).toStrictEqual({ value: output });
          }),
        );
      });
    });

    function arbitraryPositiveInteger() {
      return arbitraryInteger({ min: 1 })
        .map((input) => positiveInteger(input))
        .filter((result) => result.issues === undefined)
        .map((result) => result.value);
    }
  });
}
