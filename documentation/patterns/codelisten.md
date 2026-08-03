# Codelisten

## Problem

In the schemata of the XJustiz standard, there is the concept of so called
Codelisten. These are basically fixed lists of possible code values with
description — like an enumeration. Each Codelisteneintrag is identifies by its
code. This is also the only part that is included in an XJustiz-Nachricht for
transfer in the shape of `{ "code": "107" }` in JSON. Furthermore, each
Codelisteneintrag usually has some descriptive field that is more human readable
like Wert, Name, or Bezeichnung. For example, in the Codeliste for Geschlecht
the code `2` has the Wert `weiblich`. Or in the Codeliste for Währung the code
`EUR` has the Beschreibung `Euro`.

When composing an XJustiz-Nachricht, Codelisten must be a restrictive type
by the schema, but it should also be possible to provide values in a human
readable format.

## Solution

Each Codeliste is represented as combination of a constant object mapping and
a related type. The mapping has an entry per Codelisteneintrag
The name of each entry should be based on a descriptive field that suits this
purpose best (short, concise). The value becomes the code itself in the expected
wrapper shape (`{ code: "107" }`). The related type is basically the union of
all codes in the list.

The mapping makes the Codeleisteneinträge accessible by descriptive name for
application without having to know the codes. The data itself properly contains
the actual code as expected by the schemata. Because a constant object is used,
the type can be inferred by the compiler.

The names of Codelisteneinträge are in PascalCase, as it is idiomatic for
enumerations. The chosen descriptive field of the respective Codeliste must be
formatted for compliance. Fields like Wert are usually concise, but can still
contain whitespaces, dashes, and other symbols not allowed as member name. After
all, the name must only be just clear enough. [Design
principles](../../DESIGN_PRINCIPLES.md#german-domain-language) for the German
language in code apply — like transliterations. However, there might be
exceptions where such formatting is harmful. In such cases plain strings can be
used as keys. Though, this can affect users negatively, because they have to use
the bracket notation then (`SomeCodelist["some name"]`).

While the codes for many Codelisten look like numbers, they are technically
strings. This can't be simplified, because there are codes like `"012"`, which
would be just `12` as number. Besides, there are multiple Codelisten where the
code could not be interpreted as number (e.g. Währung).

To reduce the boilerplate and to make it somewhat better documented, Codelisten
are created with some utilities provided by the [reference
implementation](../../package/src/xjustiz-schemata/shared-kernel/codelisten.ts).
An example looks like this:

`Geschlecht.ts`:

```typescript
type Geschlecht = InferCodeliste<typeof Codeliste>;

const Geschlecht = defineCodeliste({
  Maennlich: "1",
  Weiblich: "2",
  Divers: "3",
});

const weiblich: { readonly code: "2" } = Geschlecht.Weiblich;
```

Codelisten can be long and extensive. Following the [design
principles](../../DESIGN_PRINCIPLES.md#progressive-implementation-by-use-case),
Codelisten are also progressively implemented by use case. That means members
are reduced to relevant Codelisteneinträge. The Court Communication team
provides the domain expertise for the Access to Justice project. Thereby, the
need for new Codelisteneinträge can be recognized and added early in the
process.

### Why Not ..?

#### Plain Enumerations

Plain enumerations would be much simpler to use and have less boilerplate by
default, because they are first-level constructs of the programming language.
However, it is not possible to initialize an enumeration member with an object.
So this is not possible:

```typescript
enum Geschlecht {
  Maennlich = { code: "1" },
  Weiblich = { code: "2" },
  Divers = { code: "3" },
}
```

Without, it needs some mechanism that somehow transforms the data structure to
wrap a code as object with property `code` as required by the XJustiz schemata.
Such mechanism is hard to establish and rather unreliable. The best case
scenario is still to construct the full data right away.

#### Symbols for Code Values

Using symbols in constant objects is common pattern for so called symbol
enumerations. Each symbol is guaranteed to be unique — at compile-time and
runtime. Thereby, two codes that are equal by raw value become different and
distinguishable.

```typescript
export const Geschlecht = {
  Maennlich: Symbol("1"),
  Weiblich: Symbol("2"),
  Divers: Symbol("3"),
} as const;
```

Unfortunately, symbols can't be serialized natively. Codes disappear silently.
This is missed quickly, causing unexpected issues late in the pipeline. After
all, codes are only unique within their Codeliste. Issues in the
XJustiz-Converter are avoided at compile-time when composing a message.
