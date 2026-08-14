import {
  type FindAllIdentifierDeclarations,
  type FindAllIdentifierReferences,
  type IdentifierDeclaration,
  type Reference,
} from "./occurrences";

/*
 * Type-level computations to verify the referential integrity for the identity
 * constraints. See the [related
 * section](../../../../../documentation/patterns/identifiers.md#verifying-constraints)
 * in the pattern documentation for identifiers in regards of further details and
 * reasoning.
 */

export type VerifyReferentialIntegrity<Document> =
  FindMissingIdentifierDeclarations<Document> extends infer MissingIdentifierDeclarations
    ? IsEmpty<MissingIdentifierDeclarations> extends true
      ? AllGood
      : DanglingReferencesError<MissingIdentifierDeclarations>
    : Unreachable;

type FindMissingIdentifierDeclarations<Document> = Exclude<
  FindAllIdentifierReferences<Document>,
  FindAllIdentifierDeclarations<Document>
>;

export type DanglingReferencesError<MissingIdentifierDeclarations> = TypeError &
  "Found dangling references. Add all missing elements that are referenced." & {
    readonly missingIdentifierReferences: MissingIdentifierDeclarations;
  };

type IsEmpty<MaybeEmpty> = [MaybeEmpty] extends [never] ? true : false;
type AllGood = never;
type Unreachable = never;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("verify referential integrity", () => {
    it("is all good for an empty object", () => {
      // oxlint-disable-next-line typescript/ban-types
      expectTypeOf<VerifyReferentialIntegrity<{}>>().toBeNever();
    });

    it("is all good for an empty array", () => {
      expectTypeOf<VerifyReferentialIntegrity<unknown[]>>().toBeNever();
    });

    it("is all good when there are no references in the document", () => {
      expectTypeOf<
        VerifyReferentialIntegrity<{
          foo: {
            id: "a" & IdentifierDeclaration;
            property: string;
          };
          bar: {
            counter: "b" & IdentifierDeclaration;
            data: [number, boolean];
            siblings: [
              { id: "c" & IdentifierDeclaration },
              "d" & IdentifierDeclaration,
            ];
          };
        }>
      >().toBeNever();
    });

    it("is all good when each references identifier is declared anywhere in the document", () => {
      expectTypeOf<
        VerifyReferentialIntegrity<{
          foo: {
            id: "a" & IdentifierDeclaration;
            property: string;
            secondary: [
              Reference<"c" & IdentifierDeclaration>,
              Reference<"d" & IdentifierDeclaration>,
            ];
            ref: {
              something?: Reference<"b" & IdentifierDeclaration>;
            };
          };
          bar: {
            counter: "b" & IdentifierDeclaration;
            reference: Reference<"a" & IdentifierDeclaration> | string;
            data: [number, boolean];
            siblings: [
              { id: "c" & IdentifierDeclaration },
              {
                id: "d" & IdentifierDeclaration;
                with: Reference<"c" & IdentifierDeclaration>;
              },
            ];
          };
        }>
      >().toBeNever();
    });

    it("reports an error for a plain reference", () => {
      expectTypeOf<
        VerifyReferentialIntegrity<Reference<"a" & IdentifierDeclaration>>
      >().toEqualTypeOf<
        TypeError &
          "Found dangling references. Add all missing elements that are referenced." & {
            readonly missingIdentifierReferences: "a" & IdentifierDeclaration;
          }
      >();
    });

    it("reports an error for some referenced identifier no declaration could be found anywhere in the document", () => {
      expectTypeOf<
        VerifyReferentialIntegrity<{
          foo: {
            id: "a" & IdentifierDeclaration;
            property: string;
            secondary: [
              Reference<"c" & IdentifierDeclaration>,
              Reference<"d" & IdentifierDeclaration>,
            ];
            ref: {
              something?: Reference<"b" & IdentifierDeclaration>;
            };
          };
          bar: {
            counter: "bar" & IdentifierDeclaration;
            reference: Reference<"a" & IdentifierDeclaration> | string;
            data: [number, boolean];
            siblings: [
              {
                id: "d" & IdentifierDeclaration;
                with: Reference<"c" & IdentifierDeclaration>;
              },
            ];
          };
        }>
      >().toEqualTypeOf<
        TypeError &
          "Found dangling references. Add all missing elements that are referenced." & {
            readonly missingIdentifierReferences:
              | ("c" & IdentifierDeclaration)
              | ("b" & IdentifierDeclaration);
          }
      >();
    });
  });
}
