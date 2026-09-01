import { type Beweis } from "~/xjustiz-schemata/klaver/composites";
import { type BeweisNummer } from "~/xjustiz-schemata/klaver/beweis-nummer";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
import { reference } from "~/xjustiz-schemata/shared-kernel/identifiers";

/**
 * Constructs a {@link Beweis} with Zeugen as Beweismittel. The referenced
 * Beteiligung which acts as Zeuge must have {@link Rollenbezeichnung.Zeuge} as
 * one of their roles.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // Define the Beteiligung which acts as Zeuge.
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerForZeuge = rollennummer.first(Rollenbezeichnung.Zeuge);
 *   // ...
 *
 *   const beweisNummer = createBeweisNummerGenerator(scope);
 *   const beweisNummerForZeuge = beweisNummer.first();
 *   const zeugeAsBeweis = zeuge(scope, beweisNummerForZeuge, rollennummerForZeuge);
 *
 *   // Use Beteiligung and Beweis in the message ...
 * })
 * ```
 */
export function zeuge<
  NachrichtenScope,
  const Nummer extends BeweisNummer<NachrichtenScope>,
  const RollennummerDesZeugen extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Zeuge
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  beweisNummer: Nummer,
  rollennummerDesZeugen: RollennummerDesZeugen,
) {
  return {
    beweisNummer,
    auswahlBeweismittel: {
      zeugen: { refRollennummer: reference(rollennummerDesZeugen) },
    },
  } satisfies Beweis<NachrichtenScope>;
}

/**
 * Constructs a {@link Beweis} with a Parteivernehmung as Beweismittel. The
 * referenced Beteiligung of the Partei to be interrogated must have at
 * least one of the matching roles.
 *
 * @example
 * ```typescript
 * someMessageOrchestrator((scope) => {
 *   // Define the Beteiligung of the Partei to be interrogated.
 *   const rollennummer = createRollennummerGenerator(scope);
 *   const rollennummerForKlaeger = rollennummer.first(Rollenbezeichnung.Zeuge);
 *   // ...
 *
 *   const beweisNummer = createBeweisNummerGenerator(scope);
 *   const beweisNummerForParteivernehmung = beweisNummer.first();
 *   const beweisOfAParteivernehmung = parteivernehmung(
 *     scope,
 *     beweisNummerForParteivernehmung,
 *     rollennummerForKlaeger,
 *   );
 *
 *   // Use Beteiligung and Beweis in the message ...
 * })
 * ```
 */
export function parteivernehmung<
  NachrichtenScope,
  const Nummer extends BeweisNummer<NachrichtenScope>,
  const RollennummerDerPartei extends Rollennummer<
    NachrichtenScope,
    typeof Rollenbezeichnung.Klaeger | typeof Rollenbezeichnung.Beklagter
  >,
>(
  _scope: ScopeToken<NachrichtenScope>,
  beweisNummer: Nummer,
  rollennummerDerPartei: RollennummerDerPartei,
) {
  return {
    beweisNummer,
    auswahlBeweismittel: {
      parteivernehmung: { refRollennummer: reference(rollennummerDerPartei) },
    },
  } satisfies Beweis<NachrichtenScope>;
}
