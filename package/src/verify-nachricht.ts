// oxlint-disable max-lines
import {
  type Codelisteneintrag,
  type IsCodeliste,
} from "~/xjustiz-schemata/shared-kernel/codelisten";
import { type IndicesOfTuple, type IsTuple } from "~/metatypes";
import { type VerifyIdentityConstraints } from "~/xjustiz-schemata/shared-kernel/identifiers";

/**
 * A Nachricht based on a `MessageProfile` that was successfully verified as
 * final step of the composition.
 *
 * A verified Nachricht depends on a related message profile and can be only
 * constructed by the verification function exported by the matching message
 * orchestrator. The respective verification function will verify the message for
 * identity constraints, excess properties, and other requirements that are not
 * part of the message profile itself. Detected issues will be raised as type
 * errors by the compiler.
 */
export type VerifiedNachricht<MessageProfile> = MessageProfile & {
  readonly [TAG]: "Use the verify function related to the message profile from the matching message orchestrator to construct a verified Nachricht.";
};

declare const TAG: unique symbol;

/**
 * Type-level verification of multiple constraints on `Nachricht`, based on the
 * related `MessageProfile`. The resolved type can either be a successfully
 * {@link VerifiedNachricht} or all the detected errors.
 */
export type VerifiedNachrichtOrErrors<Nachricht, MessageProfile> =
  | VerifyIdentityConstraints<Nachricht>
  | VerifyNoExcessProperties<Nachricht, MessageProfile> extends infer Errors
  ? [Errors] extends [never]
    ? VerifiedNachricht<Nachricht>
    : Errors
  : never;

export type ExcessPropertiesError<ExcessProperties> = TypeError &
  "Found properties in Nachricht not allowed by the message profile. Remove excess properties." & {
    readonly excessProperties: ExcessProperties;
  };

type VerifyNoExcessProperties<Nachricht, MessageProfile> =
  FindExcessProperties<Nachricht, MessageProfile> extends infer ExcessProperties
    ? IsEmpty<ExcessProperties> extends false
      ? ExcessPropertiesError<ExcessProperties>
      : AllGood
    : Unreachable;

type FindExcessProperties<Nachricht, MessageProfile> =
  // Improve performance by skipping potentially huge unions of Codelisten
  IsCodeliste<MessageProfile> extends true
    ? [Nachricht] extends [object]
      ? Exclude<keyof Nachricht, keyof MessageProfile> // Potential excess property keys!
      : StructuralIncompatibilityIssues
    : HasMatchingVariantOfMessageProfileWithoutExcessProperties<
          Nachricht,
          MessageProfile
        > extends true
      ? AllGood
      : Exclude<
          FindExcessPropertiesAgainst<Nachricht, MessageProfile>,
          StructuralIncompatibilityIssues
        >;

/**
 * A `MessageProfile` can define type unions on different levels in the
 * document tree structure. Unions of objects with different key sets are
 * especially tricky in the context of finding excess properties.
 *
 * This predicate evaluates if there is any variant of the `MessageProfile`,
 * that cleanly matches the `Nachricht` without excess properties. Because
 * {@link FindMatchingVariantOfMessageProfileWithoutExcessProperties} must
 * distribute over the union of variants, this predicate type interprets the
 * result of it — a union of by itself.
 *
 * Because of dealing with unions, there is no way to implement it so excess
 * properties are collected, while trying to find a clean variant. In case this
 * predicate evaluates to `false`, the actual excess properties must be found
 * separate.
 */
type HasMatchingVariantOfMessageProfileWithoutExcessProperties<
  Nachricht,
  MessageProfile,
> = [
  FindMatchingVariantOfMessageProfileWithoutExcessProperties<
    Nachricht,
    MessageProfile
  >,
] extends [never]
  ? false
  : true;

/**
 * This type distributes over the variants of the `MessageProfile`. In case the
 * `MessageProfile` is not a union, there is always only one variant. If the
 * `Nachricht` matches one of the variants, meaning it has no excess properties
 * in comparison, this variant is returned as clean match.
 */
type FindMatchingVariantOfMessageProfileWithoutExcessProperties<
  Nachricht,
  MessageProfile,
> = MessageProfile extends infer VariantOfMessageProfile
  ? FindExcessPropertiesAgainst<
      Nachricht,
      VariantOfMessageProfile
    > extends infer ExcessProperties
    ? IsEmpty<ExcessProperties> extends true
      ? VariantOfMessageProfile
      : never
    : Unreachable
  : Unreachable;

type FindExcessPropertiesAgainst<Nachricht, MessageProfile> =
  Nachricht extends readonly unknown[]
    ? MessageProfile extends readonly unknown[]
      ? IsTuple<Nachricht> extends true
        ? IsTuple<MessageProfile> extends true
          ? FindExcessPropertiesBetweenTuples<Nachricht, MessageProfile>
          : FindExcessPropertiesBetweenTupleAndArray<Nachricht, MessageProfile>
        : FindExcessPropertiesBetweenArrays<Nachricht, MessageProfile>
      : StructuralIncompatibilityIssues
    : Nachricht extends object
      ? MessageProfile extends object
        ? FindExcessPropertiesBetweenObjects<Nachricht, MessageProfile>
        : StructuralIncompatibilityIssues
      : AllGood;

type FindExcessPropertiesBetweenTuples<
  Nachricht extends readonly unknown[],
  MessageProfile extends readonly unknown[],
> = {
  [Index in IndicesOfTuple<Nachricht>]: Index extends IndicesOfTuple<MessageProfile>
    ? FindExcessProperties<Nachricht[Index], MessageProfile[Index]>
    : Index; // Excess property key!
}[IndicesOfTuple<Nachricht>];

type FindExcessPropertiesBetweenTupleAndArray<
  Nachricht extends readonly unknown[],
  MessageProfile extends readonly unknown[],
> = {
  [Index in IndicesOfTuple<Nachricht>]: FindExcessProperties<
    Nachricht[Index],
    MessageProfile[number]
  >;
}[IndicesOfTuple<Nachricht>];

type FindExcessPropertiesBetweenArrays<
  Nachricht extends readonly unknown[],
  MessageProfile extends readonly unknown[],
> = FindExcessProperties<Nachricht[number], MessageProfile[number]>;

type FindExcessPropertiesBetweenObjects<
  Nachricht extends object,
  MessageProfile extends object,
> =
  | Exclude<keyof Nachricht, keyof MessageProfile> // Potential excess property keys!
  | FindExcessPropertiesInSharedKeys<Nachricht, MessageProfile>;

type FindExcessPropertiesInSharedKeys<
  Nachricht extends object,
  MessageProfile extends object,
> = {
  [Key in keyof Nachricht & keyof MessageProfile]: FindExcessProperties<
    Nachricht[Key],
    MessageProfile[Key]
  >;
}[keyof Nachricht & keyof MessageProfile];

type IsEmpty<MaybeEmpty> = [MaybeEmpty] extends [never] ? true : false;
type AllGood = never;
type Unreachable = never;

/**
 * Nachricht and MessageProfile differ in a way they can't be compared with each
 * other to find excess properties. This is a separate and deeper issue to excess
 * properties. It is not a concern of the verification for no excess properties.
 * However, it must be distinctive in the type-level computation with a plain
 * `never` case, which in some cases indicates a positive match. Without, a
 * structural incompatible Nachricht would be reported as correct.
 */
type StructuralIncompatibilityIssues = typeof StructuralIncompatibilityIssues;
declare const StructuralIncompatibilityIssues: unique symbol;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  describe("verify Nachricht", () => {
    it("resolves to a verified Nachricht when no issues are detected", () => {
      type MessageProfile = { foo: string };
      type Nachricht = { foo: string };

      expectTypeOf<
        VerifiedNachrichtOrErrors<Nachricht, MessageProfile>
      >().toEqualTypeOf<VerifiedNachricht<Nachricht>>();
    });

    it("resolves to type errors if issues are detected", () => {
      type MessageProfile = { foo: string };
      type Nachricht = { bar: string };

      expectTypeOf<
        VerifiedNachrichtOrErrors<Nachricht, MessageProfile>
      >().toExtend<TypeError>();
    });
  });

  // oxlint-disable-next-line max-lines-per-function
  describe("verify no excess properties", () => {
    it("is all good for an empty Nachricht", () => {
      type MessageProfile = { foo: string };
      type Nachricht = {}; // oxlint-disable-line typescript/ban-types

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toBeNever();
    });

    it("is all good when Nachricht matches the MessageProfile exactly", () => {
      type MessageProfile = { foo: string };
      type Nachricht = { foo: string };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toBeNever();
    });

    it("is all good when Nachricht has fewer properties than MessageProfile", () => {
      type MessageProfile = { foo: string; bar: number };
      type Nachricht = { foo: string };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toBeNever();
    });

    it("finds a single excess property in a Nachricht", () => {
      type MessageProfile = { foo: string };
      type Nachricht = { foo: string; excess: boolean };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
    });

    it("finds multiple excess properties in a Nachricht", () => {
      type MessageProfile = { foo: string };
      type Nachricht = {
        foo: string;
        firstExcess: boolean;
        secondExcess: number;
      };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toEqualTypeOf<
        ExcessPropertiesError<"firstExcess" | "secondExcess">
      >();
    });

    it("finds excess properties in a Nachricht for nested object structures", () => {
      type MessageProfile = { foo: string; bar: { baz: boolean } };
      type Nachricht = { foo: string; bar: { baz: boolean; excess: number } };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
    });

    it("finds excess properties in a Nachricht on multiple levels in a nested object structure", () => {
      type MessageProfile = {
        foo: string;
        bar: { baz: boolean };
        quux: { quuux: number };
      };

      type Nachricht = {
        foo: string;
        bar: { baz: boolean; firstExcess: number };
        quux: { secondExcess: number };
      };

      expectTypeOf<
        VerifyNoExcessProperties<Nachricht, MessageProfile>
      >().toEqualTypeOf<
        ExcessPropertiesError<"firstExcess" | "secondExcess">
      >();
    });

    // oxlint-disable-next-line max-lines-per-function
    describe("for tuple structures", () => {
      it("is all good for a Nachricht with exact matching tuple structure", () => {
        type MessageProfile = [{ foo: string }, { bar: boolean }];
        type Nachricht = [{ foo: string }, { bar: boolean }];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });

      it("finds excess properties in a Nachricht with tuple entries", () => {
        type MessageProfile = [{ foo: string }, { bar: boolean }];
        type Nachricht = [{ foo: string }, { bar: boolean; excess: number }];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
      });

      it("finds excess tuple entries in a Nachricht by their index", () => {
        type MessageProfile = [{ foo: string }];
        type Nachricht = [
          { foo: string },
          { firstExcess: number },
          { secondExcess: boolean },
        ];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<1 | 2>>();
      });

      it("is all good for a Nachricht with a tuple against an array in the message profile", () => {
        type MessageProfile = { foo: string }[];
        type Nachricht = [{ foo: string }, { foo: string }];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });

      it("finds excess properties in tuple elements against array schema", () => {
        type MessageProfile = { foo: string }[];
        type Nachricht = [{ foo: string }, { foo: string; excess: number }];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
      });

      it("is all good for a Nachricht with exact matching array structure", () => {
        type MessageProfile = { foo: string }[];
        type Nachricht = { foo: string }[];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });
    });

    // oxlint-disable-next-line max-lines-per-function
    describe("for message profiles with type unions", () => {
      it("is all good for a Nachricht that matches one variant", () => {
        type MessageProfile =
          | { foo: string }
          | { bar: boolean }
          | { baz: number };

        type Nachricht = { bar: number };

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });

      it("finds excess for a Nachricht does not match any variant, reporting all properties as excess", () => {
        type MessageProfile =
          | { foo: string }
          | { bar: boolean }
          | { baz: number };

        type Nachricht = { bar: boolean; excess: number };

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<"bar" | "excess">>();
      });

      it("is all good for a Nachricht with a tuple matching one variant of a tuple message profile", () => {
        type MessageProfile = [
          { foo: string } | { bar: string },
          { baz: number } | { quux: symbol },
        ];
        type Nachricht = [{ bar: string }, { baz: number }];

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });

      it("is all good for a Nachricht that matches a union with undefined", () => {
        type MessageProfile = { foo: string | undefined };

        expectTypeOf<
          VerifyNoExcessProperties<{ foo: string }, MessageProfile>
        >().toBeNever();

        expectTypeOf<
          VerifyNoExcessProperties<{ foo: undefined }, MessageProfile>
        >().toBeNever();
      });

      it("finds excess for a Nachricht that does not match a union with undefined", () => {
        type MessageProfile = { foo: string | undefined };
        type Nachricht = { foo: string; excess: number };

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
      });
    });

    describe("for message profiles with Codelisten", () => {
      it("is all good for a Nachricht with matching Codeliste", () => {
        type MessageProfile = {
          something:
            | Codelisteneintrag<"foo", "0">
            | Codelisteneintrag<"bar", "1">;
        };
        type Nachricht = { something: Codelisteneintrag<"bar", "1"> };

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toBeNever();
      });

      it("it finds excess properties for a Nachricht with non clean Codelisteneintrag", () => {
        type MessageProfile = {
          something:
            | Codelisteneintrag<"foo", "0">
            | Codelisteneintrag<"bar", "1">;
        };
        type Nachricht = { something: { code: "1"; excess: "bar" } };

        expectTypeOf<
          VerifyNoExcessProperties<Nachricht, MessageProfile>
        >().toEqualTypeOf<ExcessPropertiesError<"excess">>();
      });
    });

    it("ignores mismatching type structure between Nachricht and message profile", () => {
      expectTypeOf<
        VerifyNoExcessProperties<[string], { foo: string }>
      >().toBeNever();

      expectTypeOf<
        VerifyNoExcessProperties<string[], [string, string]>
      >().toBeNever();

      expectTypeOf<
        VerifyNoExcessProperties<{ foo: string }, string>
      >().toBeNever();
    });
  });
}
