import {
  type DistinctiveMarker,
  type GetDistinctValueFrom,
} from "./generation";
import {
  type FindAllIdentifierDeclarations,
  type FindAllIdentifierReferences,
  type IdentifierDeclaration,
  type Reference,
} from "./occurrences";
import { type IndicesOfTuple, type IsEqualTo, type IsTuple } from "~/metatypes";

/*
 * Type-level computations to verify the uniqueness of identifier declarations
 * for the identity constraints. See the [related
 * section](../../../../../documentation/patterns/identifiers.md#verifying-constraints)
 * in the pattern documentation for identifiers in regards of further details and
 * reasoning.
 */

export type VerifyUniquenessOfIdentifierDeclarations<Document> =
  FindUncheckableCollectionsWithIdentifiers<Document> extends infer UncheckableCollectionsWithIdentifiers
    ? IsEmpty<UncheckableCollectionsWithIdentifiers> extends false
      ? UncheckableCollectionsWithIdentifiersError<UncheckableCollectionsWithIdentifiers>
      : FindDuplicateIdentifierDeclarations<Document> extends infer DuplicateIdentifierDeclarations
        ? IsEmpty<DuplicateIdentifierDeclarations> extends false
          ? DuplicateIdentifierDeclarationsError<DuplicateIdentifierDeclarations>
          : AllGood
        : Unreachable
    : Unreachable;

type FindUncheckableCollectionsWithIdentifiers<DocumentPart> =
  DocumentPart extends readonly (infer Entry)[]
    ? IsTuple<DocumentPart> extends true
      ? FindUncheckableCollectionsWithIdentifiers<Entry>
      : IncludesIdentifierDeclarationsOrReferences<Entry> extends true
        ? Entry
        : AllGood
    : DocumentPart extends object
      ? FindUncheckableCollectionsWithIdentifiers<
          DocumentPart[keyof DocumentPart]
        >
      : AllGood;

type IncludesIdentifierDeclarationsOrReferences<DocumentPart> =
  IsEmpty<FindAllIdentifierDeclarations<DocumentPart>> extends true
    ? IsEmpty<FindAllIdentifierReferences<DocumentPart>> extends true
      ? false
      : true
    : true;

export type UncheckableCollectionsWithIdentifiersError<
  UncheckableCollectionsWithIdentifiers,
> = TypeError &
  "Found collection including identifiers that can't be verified for uniqueness. Try to use the `satisfies` operator." & {
    readonly uncheckableCollectionsWithIdentifiers: UncheckableCollectionsWithIdentifiers;
  };

/*
 * Finding duplicates is a bit tricky, because collecting all declarations into
 * a union would just collapse duplicates. Instead, the trick is to traverse the
 * document, collect the declarations of all properties separated, and check for
 * collisions among siblings. Duplicates within the same subtree of a document
 * are found by doing this recursively deep into the document structure.
 */
type FindDuplicateIdentifierDeclarations<DocumentPart> =
  DocumentPart extends readonly unknown[]
    ? // Requires VerifyUniquenessOfIdentifierDeclarations because plain arrays collapse here undetected.
      FindDuplicateIdentifierDeclarationsAmongSiblings<
        DocumentPart,
        IndicesOfTuple<DocumentPart>
      >
    : DocumentPart extends object
      ? FindDuplicateIdentifierDeclarationsAmongSiblings<
          DocumentPart,
          keyof DocumentPart
        >
      : NoDuplicates;

type FindDuplicateIdentifierDeclarationsAmongSiblings<
  DocumentPart,
  Keys extends keyof DocumentPart,
> = {
  [Key in Keys]:
    | FindDuplicateIdentifierDeclarations<DocumentPart[Key]>
    | (Exclude<Keys, Key> extends infer SiblingKeys extends keyof DocumentPart
        ? IsEmpty<SiblingKeys> extends true
          ? NoDuplicates
          : FindDuplicateIdentifierDeclarationsBetweenGroups<
              FindAllIdentifierDeclarations<DocumentPart[Key]>,
              FindAllIdentifierDeclarations<DocumentPart[SiblingKeys]>
            >
        : Unreachable);
}[Keys];

type FindDuplicateIdentifierDeclarationsBetweenGroups<Left, Right> =
  Left extends unknown // Distribute ("iterate") over entries in Left
    ? Right extends unknown // Distribute ("iterate") over entries in Right
      ? IsEqualTo<
          GetDistinctValueFrom<Left>,
          GetDistinctValueFrom<Right>
        > extends true
        ? Left
        : NoDuplicates
      : Unreachable
    : Unreachable;

export type DuplicateIdentifierDeclarationsError<
  DuplicateIdentifierDeclarations,
> = TypeError &
  "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
    readonly duplicateIdentifierDeclarations: DuplicateIdentifierDeclarations;
  };

type IsEmpty<MaybeEmpty> = [MaybeEmpty] extends [never] ? true : false;
type AllGood = never;
type NoDuplicates = never;
type Unreachable = never;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("verify uniqueness of identifier declarations", () => {
    it("is all good for an empty object", () => {
      // oxlint-disable-next-line typescript/ban-types
      expectTypeOf<VerifyUniquenessOfIdentifierDeclarations<{}>>().toBeNever();
    });

    it("is all good for an empty array", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<unknown[]>
      >().toBeNever();
    });

    it("is all good for an object with a single identifier declaration", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          identifier: "a" & IdentifierDeclaration;
        }>
      >().toBeNever();
    });

    it("is good for a tuple with a single identifier declaration", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          identifiers: ["a" & IdentifierDeclaration];
        }>
      >().toBeNever();
    });

    it("is good for a tuple with multiple unique identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          identifiers: [
            "a" & IdentifierDeclaration,
            "b" & IdentifierDeclaration,
          ];
        }>
      >().toBeNever();
    });

    it("reports an error for a tuple with duplicate identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<
          ["a" & IdentifierDeclaration, "a" & IdentifierDeclaration]
        >
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations: "a" &
              IdentifierDeclaration;
          }
      >();
    });

    it("is good for an array without any identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          something: (string | number)[];
        }>
      >().toBeNever();
    });

    it("reports an error for an array with plain identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          identifiers: (string & IdentifierDeclaration)[];
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found collection including identifiers that can't be verified for uniqueness. Try to use the `satisfies` operator." & {
            readonly uncheckableCollectionsWithIdentifiers: string &
              IdentifierDeclaration;
          }
      >();
    });

    it("reports an error for an array with a plain reference", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          identifiers: Reference<IdentifierDeclaration>[];
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found collection including identifiers that can't be verified for uniqueness. Try to use the `satisfies` operator." & {
            readonly uncheckableCollectionsWithIdentifiers: Reference<IdentifierDeclaration>;
          }
      >();
    });

    it("is all good for a document with unique identifier declarations cross multiple properties", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          id: "a" & IdentifierDeclaration;
          identifier: "b" & IdentifierDeclaration;
          key: "c" & IdentifierDeclaration;
        }>
      >().toBeNever();
    });

    it("reports an error for a document with duplicate identifier declarations cross multiple properties", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          id: "a" & IdentifierDeclaration;
          identifier: "b" & IdentifierDeclaration;
          key: "a" & IdentifierDeclaration;
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations: "a" &
              IdentifierDeclaration;
          }
      >();
    });

    it("is all good for a document with unique identifier declarations nested in the same property", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
            key: "b" & IdentifierDeclaration;
          };
        }>
      >().toBeNever();
    });

    it("reports an error for a document with duplicate identifier declarations nested in the same property", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
            identifier: "b" & IdentifierDeclaration;
            key: "a" & IdentifierDeclaration;
            deeper: {
              id: "b" & IdentifierDeclaration;
            };
          };
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations:
              | ("a" & IdentifierDeclaration)
              | ("b" & IdentifierDeclaration);
          }
      >();
    });

    it("reports an error for a document with duplicate identifier declarations cross multiple nested properties", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
          };
          bar: {
            id: "a" & IdentifierDeclaration;
          };
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations: "a" &
              IdentifierDeclaration;
          }
      >();
    });

    it("is all good for a document with widely distributed unique identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
            property: string;
            secondary: [
              ("b" & IdentifierDeclaration) | undefined,
              { key: "c" & IdentifierDeclaration },
            ];
          };
          bar: {
            counter: "d" & IdentifierDeclaration;
            siblings: [
              { id: ("e" & IdentifierDeclaration) | string },
              { id: "f" & IdentifierDeclaration },
            ];
          };
        }>
      >().toBeNever();
    });

    it("reports an all good for a document with widely distributed unique identifier declarations", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
            property: string;
            secondary: [
              ("b" & IdentifierDeclaration) | undefined,
              { key: "a" & IdentifierDeclaration },
            ];
          };
          bar: {
            counter: "c" & IdentifierDeclaration;
            siblings: [
              { id: ("d" & IdentifierDeclaration) | string },
              { id: "b" & IdentifierDeclaration },
            ];
          };
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations:
              | ("a" & IdentifierDeclaration)
              | ("b" & IdentifierDeclaration);
          }
      >();
    });

    it("ignores 'duplicate' identifier declarations wrapped in a reference", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          foo: {
            id: "a" & IdentifierDeclaration;
          };
          bar: {
            reference: Reference<"a" & IdentifierDeclaration>;
          };
        }>
      >().toBeNever();
    });

    it("is all good when identifier declarations are based on unique distinctive values", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          id: "a" & DistinctiveMarker<"a", 1> & IdentifierDeclaration;
          identifier: "a" & DistinctiveMarker<"a", 2> & IdentifierDeclaration;
          key: "b" & DistinctiveMarker<"b", 1> & IdentifierDeclaration;
        }>
      >().toBeNever();
    });

    it("reports an error when identifier declarations are duplicates by theirs distinctive values", () => {
      expectTypeOf<
        VerifyUniquenessOfIdentifierDeclarations<{
          id: "a" & DistinctiveMarker<"a", 1> & IdentifierDeclaration;
          identifier: "a" & DistinctiveMarker<"a", 1> & IdentifierDeclaration;
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found duplicate identifier declarations. Remove duplicate element or generate separate identifier." & {
            readonly duplicateIdentifierDeclarations: "a" &
              DistinctiveMarker<"a", 1> &
              IdentifierDeclaration;
          }
      >();
    });
  });
}
