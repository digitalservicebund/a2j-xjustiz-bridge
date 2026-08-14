import { type Increment } from "~/metatypes";

/*
 * Utilities for identifier types that are distinctive to the compiler for
 * identity constraints. See the [related
 * section](../../../../../documentation/patterns/identifiers.md#generation-with-distinctive-markers)
 * in the pattern documentation for identifiers in regards of further details and
 * reasoning.
 */

export interface DistinctiveMarker<Value, Ordinal extends number> {
  readonly [DISTINCTIVE_MARKER]: readonly [Value, Ordinal];
}

declare const DISTINCTIVE_MARKER: unique symbol;

export type GetDistinctValueFrom<MaybeDistinctivelyMarked> =
  MaybeDistinctivelyMarked extends {
    readonly [DISTINCTIVE_MARKER]: readonly [infer Value, infer Ordinal];
  }
    ? [Value, Ordinal]
    : MaybeDistinctivelyMarked;

/*
 * Due to higher-kinded types, there is no possibility to share this type pattern
 * to be used for identifier type modules. Therefore, this type acts only as
 * demonstrative example with some tests as proof.
 */
interface Generator<Value> {
  readonly first: () => Value & DistinctiveMarker<Value, 0>;
  readonly next: <Ordinal extends number>(
    previous: Value & DistinctiveMarker<Value, Ordinal>,
  ) => Value & DistinctiveMarker<Value, Increment<Ordinal>>;
}

export interface NonDistinctiveGenerator<Value> {
  readonly first: () => Value;
  readonly next: (previous: Value) => Value;
}

export function memorizeAsGenerator<Value>(
  produceValue: () => Value,
): NonDistinctiveGenerator<Value> {
  const firstValue = produceValue();
  const previousToNextValue = new Map<Value, Value>();

  return {
    first: () => firstValue,
    next: (previousValue) => {
      const nextValue = previousToNextValue.get(previousValue);

      if (nextValue === undefined) {
        const newValue = produceValue();
        previousToNextValue.set(previousValue, newValue);
        return newValue;
      }

      return nextValue;
    },
  };
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("identifier generation", () => {
    it("allows to the values distinctive on the type-level", () => {
      expectTypeOf<string & DistinctiveMarker<string, 1>>().not.toEqualTypeOf<
        string & DistinctiveMarker<string, 2>
      >();
    });

    it("get distinctive value resolves to the tuple of the value and ordinal", () => {
      expectTypeOf<
        GetDistinctValueFrom<DistinctiveMarker<string, 1>>
      >().toEqualTypeOf<[string, 1]>();
    });

    describe("basic concept of generator", () => {
      it("makes produced values distinctive with incrementing ordinal", () => {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const generator = {
          first: () => 0,
          next: (previous: number) => previous + 1,
        } as unknown as Generator<number>;

        const firstValue = generator.first();
        const secondValue = generator.next(firstValue);
        const thirdValue = generator.next(secondValue);

        expectTypeOf(firstValue).toEqualTypeOf<
          number & DistinctiveMarker<number, 0>
        >();

        expectTypeOf(secondValue).toEqualTypeOf<
          number & DistinctiveMarker<number, 1>
        >();

        expectTypeOf(thirdValue).toEqualTypeOf<
          number & DistinctiveMarker<number, 2>
        >();
      });
    });

    describe("memorize as generator", () => {
      it("has a stable first value", () => {
        const generator = memorizeAsGenerator(Math.random);

        expect(generator.first()).toBe(generator.first());
      });

      it("returns the same value for every sequence element", () => {
        const generator = memorizeAsGenerator(Math.random);
        let lastValue = generator.first();

        repeat(100, () => {
          const nextValue = generator.next(lastValue);
          expect(generator.next(lastValue)).toBe(nextValue);
          lastValue = nextValue;
        });
      });
    });
  });

  function repeat(times: number, callable: () => void): void {
    for (let counter = 0; counter < times; counter++) {
      callable();
    }
  }
}
