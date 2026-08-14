/*
 * Utilities for identifier types to distinguish between identifiers in the
 * position of a declaration or reference. See the [related
 * section](../../../../../documentation/patterns/identifiers.md#occurrences) in
 * the pattern documentation for identifiers in regards of further details and
 * reasoning.
 */

export interface IdentifierDeclaration {
  readonly [IDENTIFIER_DECLARATION_MARKER]: "Marker for identifiers that occurs in the declaration position (in contrast to references).";
}

declare const IDENTIFIER_DECLARATION_MARKER: unique symbol;

/**
 * A marker for an identifier for the purpose to reference to the element that
 * actually declares and can be identified this identifier (see
 * {@link IdentifierDeclaration}). Use the {@link reference} function to create
 * a {@link Reference} from a generated identifier.
 */
export interface Reference<Identifier extends IdentifierDeclaration> {
  readonly [IDENTIFIER_REFERENCE_MARKER]: Identifier;
}

declare const IDENTIFIER_REFERENCE_MARKER: unique symbol;

/**
 * Wraps a given declaration of an `Identifier` to be used as a {@link Reference}.
 */
export function reference<Identifier extends IdentifierDeclaration>(
  identifier: Identifier,
): Reference<Identifier> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return identifier as unknown as Reference<Identifier>;
}

export type FindAllIdentifierDeclarations<DocumentPart> =
  DocumentPart extends IdentifierDeclaration
    ? DocumentPart
    : DocumentPart extends Reference<IdentifierDeclaration>
      ? never
      : DocumentPart extends readonly (infer Entry)[]
        ? FindAllIdentifierDeclarations<Entry>
        : DocumentPart extends object
          ? FindAllIdentifierDeclarations<DocumentPart[keyof DocumentPart]>
          : never;

export type FindAllIdentifierReferences<DocumentPart> =
  DocumentPart extends Reference<IdentifierDeclaration>
    ? ExtractIdentifierDeclarationFrom<DocumentPart>
    : DocumentPart extends readonly (infer Entry)[]
      ? FindAllIdentifierReferences<Entry>
      : DocumentPart extends object
        ? FindAllIdentifierReferences<DocumentPart[keyof DocumentPart]>
        : never;

type ExtractIdentifierDeclarationFrom<
  SomeReference extends Reference<IdentifierDeclaration>,
> = SomeReference extends {
  readonly [IDENTIFIER_REFERENCE_MARKER]: infer Declaration;
}
  ? Declaration
  : never;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("identifier occurrences", () => {
    describe("declarations", () => {
      it("finds all identifier declarations recursively, ignoring occurrences wrapped as reference", () => {
        expectTypeOf<
          FindAllIdentifierDeclarations<{
            foo: string;
            identifier: "a" & IdentifierDeclaration;
            secondary: [
              "b" & IdentifierDeclaration,
              "c" & IdentifierDeclaration,
            ];
            ref: {
              something: Reference<"d" & IdentifierDeclaration>;
            };
            bar: {
              key: "e" & IdentifierDeclaration;
              refererence: Reference<"f" & IdentifierDeclaration>;
              count: number;
              siblings: [
                {
                  id: "g" & IdentifierDeclaration;
                  parents: [
                    Reference<"h" & IdentifierDeclaration>,
                    { ref: Reference<"i" & IdentifierDeclaration> },
                  ];
                },
                {
                  id: "j" & IdentifierDeclaration;
                },
              ];
              start: Date;
            };
            call: (value: boolean) => void;
            unknownIdentifier: "k";
          }>
        >().toEqualTypeOf<
          | ("a" & IdentifierDeclaration)
          | ("b" & IdentifierDeclaration)
          | ("c" & IdentifierDeclaration)
          | ("e" & IdentifierDeclaration)
          | ("g" & IdentifierDeclaration)
          | ("j" & IdentifierDeclaration)
        >();
      });
    });

    // oxlint-disable-next-line max-lines-per-function
    describe("references", () => {
      it("wraps the declared identifier opaquely", () => {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const someIdentifier = "some-id" as string & IdentifierDeclaration;

        expectTypeOf(
          reference(someIdentifier),
        ).not.toExtend<IdentifierDeclaration>();
      });

      it("finds all references recursively, mapped to their identifier declaration", () => {
        expectTypeOf<
          FindAllIdentifierReferences<{
            foo: string;
            identifier: "a" & IdentifierDeclaration;
            secondary: [
              "b" & IdentifierDeclaration,
              "c" & IdentifierDeclaration,
            ];
            ref: {
              something: Reference<"d" & IdentifierDeclaration>;
            };
            bar: {
              key: "e" & IdentifierDeclaration;
              refererence: Reference<"f" & IdentifierDeclaration>;
              count: number;
              siblings: [
                {
                  id: "g" & IdentifierDeclaration;
                  parents: [
                    Reference<"h" & IdentifierDeclaration>,
                    { ref: Reference<"i" & IdentifierDeclaration> },
                  ];
                },
                {
                  id: "j" & IdentifierDeclaration;
                },
              ];
              start: Date;
            };
            call: (value: boolean) => void;
            unknownIdentifier: "k";
          }>
        >().toEqualTypeOf<
          | ("d" & IdentifierDeclaration)
          | ("f" & IdentifierDeclaration)
          | ("h" & IdentifierDeclaration)
          | ("i" & IdentifierDeclaration)
        >();
      });
    });
  });
}
