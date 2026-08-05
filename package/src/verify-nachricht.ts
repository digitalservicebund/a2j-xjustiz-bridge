import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
import { type VerifyIdentityConstraints } from "~/xjustiz-schemata/shared-kernel/identifiers";

/**
 * A Nachricht based on a message profile that was successfully verified as final
 * step of the composition.
 *
 * A verified Nachricht can only be constructed using the {@link verifyNachricht}
 * function. It will verify the message for identity constraints and other
 * requirements that are not part of the message profile itself. Detected
 * issues will be raised as type errors by the compiler.
 */
export type VerifiedNachricht<MessageProfile> = MessageProfile & {
  readonly [TAG]: "Use the `verifyNachricht` function to verify a composed Nachricht for the matching message profile.";
};

declare const TAG: unique symbol;

/**
 * Used as last step of composing a message with an orchestrator to output
 * a valid {@link VerifiedNachricht}. It will apply multiple type-level
 * computations to verify constraints like for identities.
 *
 * In the successful case, when there are no issues, it resoles to the original
 * message. Otherwise, it resolves to all detected issues, causing a mismatch
 * on the output of the message composer.
 *
 * **ATTENTION:**
 * Due to restrictions of the TypeScript compiler, the validation must happen in
 * the return position of the function. Thereby, issues will not be reported at
 * the {@link verifyNachricht} call itself. Hence, issues become only visible by
 * compiler errors on the outer context that expects a {@link VerifiedNachricht}.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // preparations ...
 *
 *   return verifyNachricht({
 *     // content of Nachricht ...
 *   });
 * });
 * ```
 */
export function verifyNachricht<const Nachricht>(
  nachricht: Nachricht,
): VerifiedNachrichtOrErrors<Nachricht> {
  // oxlint-disable-next-line no-unsafe-type-assertion
  return nachricht as never;
}

type VerifiedNachrichtOrErrors<Nachricht> =
  VerifyIdentityConstraints<Nachricht> extends infer Errors
    ? [Errors] extends [never]
      ? VerifiedNachricht<Nachricht>
      : Errors
    : never;

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  describe("verify Nachricht", async () => {
    const { createUuidGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/uuid"
    );

    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    const { reference } = await import(
      "~/xjustiz-schemata/shared-kernel/identifiers"
    );

    it("resolves to the original Nachricht type when no issues are detected", () => {
      withScope(<Scope>(scope: ScopeToken<Scope>) => {
        const uuid = createUuidGenerator(scope);

        const firstIdentifier = uuid.first();

        const nachricht = {
          identifier: firstIdentifier,
          relatedTo: reference(firstIdentifier),
        };

        expectTypeOf(verifyNachricht(nachricht)).toEqualTypeOf<
          VerifiedNachricht<typeof nachricht>
        >();
      });
    });

    it("resolves to type errors if issues are detected", () => {
      withScope(<Scope>(scope: ScopeToken<Scope>) => {
        const uuid = createUuidGenerator(scope);

        const firstIdentifier = uuid.first();
        const secondIdentifier = uuid.next(firstIdentifier);

        const nachricht = {
          identifier: firstIdentifier,
          relatedTo: reference(secondIdentifier),
          key: firstIdentifier,
        };

        expectTypeOf(verifyNachricht(nachricht)).toExtend<TypeError>();
      });
    });
  });
}
