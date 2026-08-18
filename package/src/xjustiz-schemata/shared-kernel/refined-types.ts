import { type DeepReadonly, type IsAny } from "~/metatypes";
import { type StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Produce a factory to construct valid instanced for a refined type.
 *
 * This is the canonical implementation for the refined types pattern. Check out
 * the [documentation of the pattern](../../../../documentation/patterns/refined-types.md)
 * for reasoning and further details. Practical examples can be discovered by
 * inspecting reference usages in the codebase.
 *
 * See the resulting {@link RefinedTypeFactory} to learn more about capabilities
 * and usage examples of factories.
 *
 * The parse function is the core piece to construct valid instances. Instances
 * can be constructed from values of type `Input`. The `Output` type is the
 * refined type itself, being opaque over the `Input`. Refined types are
 * required to be read-only, to preserve the invariants after parsing.
 * To support parsing of `unknown` values, especially for the Standard Schema
 * support, the `isInputType` type guard function bridges the gap to the parse
 * function of the refined type.
 * The `Messages` relate to the reporting of parsing issues and can be
 * customized using the `customize` function on the resulting factory.
 *
 *
 * @param isInputType type guard that bridges the gap to `parseInput` for `unknown` values
 * @param parseInput runtime parse function, curried with the issue messages as configuration
 * @param issueMessages for reporting parse issues, used internally only
 *
 * @example
 * ```typescript
 * const myRefinedType = defineRefinedType(
 *  isString,
 *  parseSomeRefinedType,
 *  defaultIssueMessages,
 * );
 * ```
 */
export function defineRefinedType<
  Input,
  ParseInput extends { (input: Input): Result<Output> },
  Messages extends IssueMessages,
  Output extends DeepReadonly<Input> = InferParseOutput<Input, ParseInput>,
>(
  isInputType: (value: unknown) => value is Input,
  parseInput: (issueMessages?: Messages) => ParseInput,
  issueMessages?: Messages,
): RefinedTypeFactory<Input, Output, ParseInput, Messages> {
  const parseWithIssueMessages = parseInput(issueMessages);

  function validateForStandardSchema(value: unknown): Result<Output> {
    if (!isInputType(value)) {
      return {
        issues: [{ message: `Unexpected input type: ${typeof value}` }],
      };
    }

    return parseWithIssueMessages(value);
  }

  const standardSchema: StandardSchemaV1.Props<Input, Output> = {
    version: 1,
    vendor: VENDOR,
    validate: validateForStandardSchema,
    types: undefined as unknown as StandardSchemaV1.Types<Input, Output>, // oxlint-disable-line no-unsafe-type-assertion -- standard practice for runtime erasure
  };

  function customize(customIssueMessages: Messages) {
    return defineRefinedType<Input, ParseInput, Messages, Output>(
      isInputType,
      parseInput,
      customIssueMessages,
    );
  }

  const factory = Object.assign(parseWithIssueMessages, {
    "~standard": standardSchema,
    customize,
  });
  Object.freeze(factory);
  return factory;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

/**
 * A factory for a refined type is a function object to construct valid
 * instances by parsing input values. Each factory is also compatible with the
 * Standard Schema specification and can be used directly as schema by itself.
 *
 * The reported messages in case of parsing issues can be customized. Therefore,
 * the `customize` method is provided with a map of custom messages per possible
 * parsing issue, producing an adapted instance of the factory.
 *
 * @example
 * ```typescript
 * // Plain runtime parsing that can succeed or fail.
 * const result = myRefinedType(someInput)
 *
 * // Optional compile-time parsing if supported by the refined type.
 * const value = myRefinedType("valid static literal").value;
 *
 * // Using with other (schema) library as Standard Schema.
 * const mySchema = someSchemaLibrary({ foo: myRefinedType });
 *
 * // Customizing messages for reported parsing issues.
 * const customMyRefinedType = myRefinedType.customize({
 *   someIssue: "some custom message",
 *   otherIssue: (metadata) => `some template with ${metadata.bar}`,
 * });
 * customMyRefinedType(someInput);
 * ```
 *
 * The actual parsing capabilities depend on the provided `ParseInput` function.
 * While every parse function must support runtime parsing, it is possible to
 * define additional compile-time parsing as well (see {@link LiteralAwareResult}).
 */
export type RefinedTypeFactory<
  Input,
  Output extends DeepReadonly<Input>,
  ParseInput extends { (input: Input): Result<Output> },
  Messages extends IssueMessages,
> = ParseInput &
  StandardSchemaV1<Input, Output> & {
    /**
     * Customize the messages for issue reporting when parsing input values.
     *
     * This results into a new instance of a construction factory for this
     * refined type, that can be used exactly as the original one. The possible
     * issues that can occur are automatically enforced and defined by the parse
     * function of the refined type and can be auto-completed.
     *
     * @example
     * ```typescript
     * const customMyRefinedType = myRefinedType.customize({
     *   someIssue: "some custom message",
     *   otherIssue: (metadata) => `some template with ${metadata.bar}`,
     * });
     *
     * customMyRefinedType("some input"); // uses custom messages
     * ```
     */
    customize: (
      customIssueMessages: Messages,
    ) => RefinedTypeFactory<Input, Output, ParseInput, Messages>;
  };

type InferParseOutput<
  Input,
  ParseInput extends (input: Input) => Result<DeepReadonly<Input>>,
> = ParseInput extends (
  input: Input,
) => Result<infer Output extends DeepReadonly<Input>>
  ? Output
  : DeepReadonly<Input>;

/**
 * Represents the result of a parsed input value. It can either be successful with
 * the parsed `value` or a list of `issues` in case of a failure. See
 * {@link LiteralAwareResult} for additional compile-time parsing capabilities to
 * predetermine the result.
 *
 * This type is a directly compatible with the Standard Schema specification.
 */
export type Result<Value, Message extends string = string> =
  | SuccessResult<Value>
  | FailureResult<Message>;

export type SuccessResult<Value> = StandardSchemaV1.SuccessResult<Value>;

export type FailureResult<Message extends string = string> =
  StandardSchemaV1.FailureResult & {
    readonly issues: readonly (StandardSchemaV1.Issue & {
      readonly message: Message;
    })[];
  };

/**
 * And advanced version of the {@link Result} type for parse functions that have
 * additional support for compile-time parsing. Using type-level computation,
 * they can predetermine the result for static literal input values.
 *
 * Pure runtime parsing of dynamic input values always result into an
 * undetermined `Result`. It can either be successful or a failure. With the
 * addition of compile-time parsing for static literal inputs, the success can
 * be predetermined. Based on the given literal, the result is known to be
 * parsed successfully or not. This provides an improved developer experience
 * as it eliminates the
 * need of result interpretation and error handling for static cases. For
 * example statically known values at compile-time just work. The parsed value
 * can be used directly without further ado.
 *
 * ```typescript
 * myRefinedType("valid input").value // Compiler guarantees that value can be used directly.
 * myRefinedType("invalid input").value // Inaccessible, always a failure with static issue.
 * myRefinedType(someDynamicInput) // Must be evaluated as result can't be predetermined.
 * ```
 *
 * To achieve this, the runtime parse function needs a pendant parse type. Such a type
 * takes a generic input value. Using conditional typing, it resolves it to
 * either a `SuccessResult` or a `FailureResult`. In case of a parsing that
 * fails already at compile-time, the predetermined result also includes
 * a static message visible to the developer. In case the used parse type is not
 * properly compatible to this specification, the result falls back to be undetermined.
 *
 * The `Input` type refers to the input parameter that can be parsed into an
 * `Output`, which is the refined type itself. A `Value` refers to a static
 * literal of an `Input` value that gets parsed. The `StaticResult` is the
 * result of the compile-time parsing, provided by a parse type as described above.
 *
 * @example
 * ```typescript
 * function parseMyRefinedType<Value extends string>(
 *   input: Value,
 * ): LiteralAwareResult<
 *   string,
 *   Value,
 *   ParseMyLiteralType<Value>, // <-- compile-time parsing is applied here
 *   MyLiteralType
 * >;
 * ```
 *
 * Check out the documentation for refined types for more details and examples.
 */
export type LiteralAwareResult<
  Input,
  Value extends Input,
  StaticResult,
  Output,
> =
  IsLiteral<Value, Input> extends true
    ? StaticResult extends SuccessResult<unknown>
      ? SuccessResult<Output>
      : StaticResult extends FailureResult<infer Message>
        ? FailureResult<Message>
        : Result<Output> // StaticResult doesn't properly resolve to a Result.
    : Result<Output>;

/**
 * A map of issues that can occur when parsing an input value fails.
 *
 * Each parse function declares the possible issues that can occur and
 * takes a matching map of messages as parameter. This decouples the actual
 * output messages from the parsing logic itself and allows for customization.
 *
 * Issues are identified by the keys in the map. There are two kind of issues.
 * Static issues are associated with a plain static string as message. Other
 * issues have additional metadata, provided to a template function that
 * produces the output message.
 *
 * Check out the documentation for refined types for more details and examples.
 */
type IssueMessages = Record<PropertyKey, string | ((...args: any) => string)>; // oxlint-disable-line no-explicit-any -- only way to define signature of any arguments

export type IsLiteral<MaybeLiteral, Base> =
  IsAny<MaybeLiteral> extends true
    ? false
    : IsAny<Base> extends true
      ? false
      : [MaybeLiteral] extends [never]
        ? false
        : [MaybeLiteral] extends [Base]
          ? [Base] extends [MaybeLiteral]
            ? false
            : true
          : false;

const VENDOR = "a2j-xjustiz-converter" as const;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  describe("refined types", () => {
    it("correctly infers the output type for the Standard Schema", () => {
      type BrandedString = string & { CHEAP_TAG: "branded string" };

      function parse(input: string): Result<BrandedString> {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return { value: input as BrandedString };
      }

      const factory = defineRefinedType(isString, () => parse);

      expectTypeOf(factory).toExtend<StandardSchemaV1<string, BrandedString>>();
    });
  });
}
