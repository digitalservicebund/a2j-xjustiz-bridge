// oxlint-disable max-lines
import {
  type AntraegeFuerZahlungsklage,
  type BegruendetheitFuerZahlungsklage,
  type Beklagter,
  type GesetzlicherVertreter,
  type Klaeger,
  type Prozessbevollmaechtiger,
  type Zahlungsklage,
  type Zeuge,
} from "~/nachricht/zahlungsklage/message-profile";
import {
  type ScopeToken,
  withScope,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import {
  type VerifiedNachricht,
  type VerifiedNachrichtOrErrors,
} from "~/verify-nachricht";
import {
  type XjustizMessageXmlResult,
  type XjustizToolsConnectionParameter,
  generateXjustizMessageXml,
} from "~/generate-xml-document";

/**
 * Message orchestrator to compose a Nachricht for a _Zahlungsklage_.
 *
 * This message profile is based on the XJustiz KLAVER module, using the generic
 * message type `nachricht.klaver.klageverfahren.3500001` with the specialization
 * of an `anderes Klageverfahren`.
 *
 * Use {@link verifyZahlungsklage} for the final return statement of the
 * `compose` function, to get a properly verified Zahlungsklage as required.
 */
export function zahlungsklage(
  compose: <NachrichtenScope>(
    scope: ScopeToken<NachrichtenScope>,
  ) => VerifiedNachricht<Zahlungsklage<NachrichtenScope>>,
  xjustizToolsConnectionParameter: XjustizToolsConnectionParameter,
): Promise<XjustizMessageXmlResult> {
  return withScope(<NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
    const nachricht = compose(scope);
    return generateXjustizMessageXml(
      JSON.stringify(nachricht),
      xjustizToolsConnectionParameter,
    );
  });
}

/**
 * Used as last step of composing a `Zahlungsklage` with the {@link zahlungsklage}
 * orchestrator to output a valid {@link VerifiedNachricht}. It will apply
 * multiple type-level computations to verify constraints like for identities or
 * excess properties.
 *
 * In the successful case, when there are no errors, it resoles to the original
 * `Nachricht`. Otherwise, it resolves to all detected issues, causing a mismatch
 * on the output of the message composer.
 *
 * **ATTENTION:**
 * Due to restrictions of the TypeScript compiler, the validation must happen in
 * the return position of the function. Thereby, issues will not be reported at
 * the function call itself. Hence, issues become only visible by
 * compiler errors on the outer context of the message orchestrator.
 *
 * @example
 * ```typescript
 * zahlungsklage((scope) => {
 *   // Preparations ...
 *   return verifyZahlungsklage({
 *     // Message ...
 *   });
 * });
 * ```
 */
export function verifyZahlungsklage<
  Scope,
  const Nachricht extends Zahlungsklage<Scope>,
>(
  _scope: ScopeToken<Scope>,
  nachricht: Nachricht,
): VerifiedNachrichtOrErrors<Nachricht, Zahlungsklage<Scope>> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return nachricht as never;
}

if (import.meta.vitest) {
  const { describe, it, expect, inject } = import.meta.vitest;
  const xjustizToolsConnectionParameter = {
    baseUrl: inject("xjustizToolsTestContainerUrl"),
  };

  // oxlint-disable-next-line max-lines-per-function
  describe("Zahlungsklage", async () => {
    const { reference } = await import(
      "~/xjustiz-schemata/shared-kernel/identifiers"
    );
    const { datatypeA } = await import(
      "~/xjustiz-schemata/din-91379/datatypeA"
    );
    const { datatypeB } = await import(
      "~/xjustiz-schemata/din-91379/datatypeB"
    );
    const { datatypeC } = await import(
      "~/xjustiz-schemata/din-91379/datatypeC"
    );
    const { datatypeD } = await import(
      "~/xjustiz-schemata/din-91379/datatypeD"
    );
    const { datatypeE } = await import(
      "~/xjustiz-schemata/din-91379/datatypeE"
    );
    const { createUuidGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/uuid"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const {
      Gerichte,
      Geschlecht,
      Kanzleiform,
      Rollenbezeichnung,
      Telekommunikationsart,
    } = await import("~/xjustiz-schemata/grunddatensatz/codelisten");
    const { Anspruchsart } = await import(
      "~/xjustiz-schemata/klaver/codelisten"
    );
    const { createBeweisNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/beweis-nummer"
    );
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );
    const { zeuge: createZeuge, parteivernehmung } = await import(
      "~/ergonomics/beweis"
    );
    const {
      antragAufAnwaltskosten,
      antragAufVersaeumnisurteil,
      weitererAntrag,
    } = await import("~/ergonomics/sonstige-antraege");
    const { geldbetrag } = await import("~/ergonomics/geldbetrag");

    // oxlint-disable-next-line max-lines-per-function
    it("is possible to create a valid example message", async () => {
      const message = await zahlungsklage(
        // oxlint-disable-next-line max-lines-per-function
        <NachrichtenScope>(scope: ScopeToken<NachrichtenScope>) => {
          const rollennummer = createRollennummerGenerator(scope);
          const rollennummerKlaeger = rollennummer.first(
            Rollenbezeichnung.Klaeger,
          );

          const klaeger = {
            rolle: [
              {
                rollennummer: rollennummerKlaeger,
                rollenbezeichnung: Rollenbezeichnung.Klaeger,
              },
            ],
            beteiligter: {
              auswahlBeteiligter: {
                natuerlichePerson: {
                  vollerName: {
                    vorname: datatypeA("Max").value,
                    titel: datatypeC("Dr.").value,
                    nachname: datatypeA("Mustermann").value,
                  },
                  geschlecht: Geschlecht.Maennlich,
                  anschrift: [
                    {
                      strasse: datatypeB("Musterstrasse").value,
                      hausnummer: datatypeB("1").value,
                      postleitzahl: datatypeC("12345").value,
                      ort: datatypeB("Musterstadt").value,
                    },
                  ],
                  telekommunikation: [
                    {
                      telekommunikationsart: Telekommunikationsart.Telefon,
                      verbindung: datatypeC("01234567890").value,
                    },
                    {
                      telekommunikationsart: Telekommunikationsart.EMail,
                      verbindung: datatypeC("max.mustermann@mustermail.de")
                        .value,
                    },
                  ],
                  bankverbindung: [
                    {
                      kontoinhaber: datatypeD("Max Mustermann").value,
                      iban: datatypeC("Bankverbindung").value,
                    },
                  ],
                },
              },
            },
          } satisfies Klaeger<NachrichtenScope>;

          const gesetzlicherVertreter = {
            rolle: [
              {
                rollenbezeichnung: Rollenbezeichnung.GesetzlicherVertreter,
                geschaeftszeichen: datatypeC("KM-0042-2026").value,
                referenz: [{ refRollennummer: reference(rollennummerKlaeger) }],
              },
            ],
            beteiligter: {
              auswahlBeteiligter: {
                raKanzlei: {
                  bezeichnung: {
                    bezeichnungAktuell: datatypeD("Kanzlei Mustermann").value,
                  },
                  kanzleiform: Kanzleiform.Einzelanwalt,
                  anschrift: [
                    {
                      strasse: datatypeB("Musterstrasse").value,
                      hausnummer: datatypeB("2").value,
                      postleitzahl: datatypeC("12345").value,
                      ort: datatypeB("Musterstadt").value,
                    },
                  ],
                  raImVerfahren: {
                    vollerName: {
                      vorname: datatypeA("Erika").value,
                      nachname: datatypeA("Mustermann").value,
                    },
                    geschlecht: Geschlecht.Weiblich,
                    beruf: [datatypeC("Rechtsanwaeltin").value],
                    telekommunikation: [
                      {
                        telekommunikationsart: Telekommunikationsart.Telefon,
                        verbindung: datatypeC("01234567891").value,
                      },
                      {
                        telekommunikationsart: Telekommunikationsart.EMail,
                        verbindung: datatypeC(
                          "erika.mustermann@kanzlei-mustermann.de",
                        ).value,
                      },
                    ],
                  },
                },
              },
            },
          } satisfies GesetzlicherVertreter<NachrichtenScope>;

          const rollennummerBeklagter = rollennummer.next(
            rollennummerKlaeger,
            Rollenbezeichnung.Beklagter,
          );

          const beklagter = {
            rolle: [
              {
                rollennummer: rollennummerBeklagter,
                rollenbezeichnung: Rollenbezeichnung.Beklagter,
              },
            ],
            beteiligter: {
              auswahlBeteiligter: {
                organisation: {
                  bezeichnung: {
                    bezeichnungAktuell: datatypeD("Muster GmbH").value,
                  },
                  anschrift: [
                    {
                      strasse: datatypeB("Musterstrasse").value,
                      hausnummer: datatypeB("3").value,
                      postleitzahl: datatypeC("12345").value,
                      ort: datatypeB("Musterstadt").value,
                    },
                  ],
                },
              },
            },
          } satisfies Beklagter<NachrichtenScope>;

          const prozessbevollmaechtiger = {
            rolle: [
              {
                rollenbezeichnung: Rollenbezeichnung.Prozessbevollmaechtiger,
                referenz: [
                  { refRollennummer: reference(rollennummerBeklagter) },
                ],
              },
            ],
            beteiligter: {
              auswahlBeteiligter: {
                natuerlichePerson: {
                  vollerName: { nachname: datatypeA("Mustermann").value },
                },
              },
            },
          } satisfies Prozessbevollmaechtiger<NachrichtenScope>;

          const rollennummerFuerZeuge = rollennummer.next(
            rollennummerBeklagter,
            Rollenbezeichnung.Zeuge,
          );

          const zeuge = {
            rolle: [
              {
                rollennummer: rollennummerFuerZeuge,
                rollenbezeichnung: Rollenbezeichnung.Zeuge,
              },
            ],
            beteiligter: {
              auswahlBeteiligter: {
                natuerlichePerson: {
                  vollerName: { nachname: datatypeA("Beweismann").value },
                },
              },
            },
          } satisfies Zeuge<NachrichtenScope>;

          const fortlaufendeNummer = createFortlaufendeNummerGenerator(scope);

          const fortlaufendeNummerAnspruch =
            fortlaufendeNummer.first("Anspruch");

          const sachantraege = {
            inhalt: datatypeE("Lorem ipsum").value,
            anspruch: [
              {
                fortlaufendeNummer: fortlaufendeNummerAnspruch,
                anspruchssteller: [
                  { refRollennummer: reference(rollennummerKlaeger) },
                ],
                anspruchsgegner: [
                  {
                    refRollennummer: reference(rollennummerBeklagter),
                  },
                ],
                anspruchsart: Anspruchsart.Zahlung,
                wertAnspruch: geldbetrag(5000),
              },
            ],
          } satisfies AntraegeFuerZahlungsklage<NachrichtenScope>["sachantraege"];

          const beweisNummer = createBeweisNummerGenerator(scope);
          const beweisNummerForZeuge = beweisNummer.first();
          const beweisOfAZeuge = createZeuge(
            scope,
            beweisNummerForZeuge,
            rollennummerFuerZeuge,
          );

          const beweisNummerForParteivernehmung =
            beweisNummer.next(beweisNummerForZeuge);

          const beweisOfAParteivernehmung = parteivernehmung(
            scope,
            beweisNummerForParteivernehmung,
            rollennummerKlaeger,
          );

          const uuid = createUuidGenerator(scope);
          const vortragsID = uuid.first();

          const begruendetheit = {
            vortrag: [
              {
                schlagwort: datatypeC("Zahlungsanspruch").value,
                vortragsID,
                ausfuehrungen: {
                  inhalt: {
                    tatsachenvortragSachverhaltsbeschreibung: datatypeC(
                      "Der Zahlungsanspruch besteht aus dem zugrunde liegenden Vertrag.",
                    ).value,
                  },
                  refBeweisNummer: [
                    reference(beweisNummerForZeuge),
                    reference(beweisNummerForParteivernehmung),
                  ],
                },
              },
            ],
          } satisfies BegruendetheitFuerZahlungsklage<NachrichtenScope>["anderesKlageverfahren"];

          const eigeneNachrichtenID = uuid.next(vortragsID);
          const fortlaufendeNummerAnwaltskosten = fortlaufendeNummer.next(
            fortlaufendeNummerAnspruch,
            "Anspruch",
          );

          return verifyZahlungsklage(scope, {
            nachrichtenkopf: {
              xjustizVersion: "3.6.2",
              erstellungszeitpunkt: Temporal.Now.instant(),
              absender: {
                informationen: {
                  auswahlKommunikationspartner: {
                    sonstige: datatypeD("Herr Dr. Max Mustermann").value,
                  },
                },
                eigeneNachrichtenID,
              },
              empfaenger: {
                informationen: {
                  auswahlKommunikationspartner: {
                    gericht: Gerichte["ZZ Test-Bund"],
                  },
                },
                auswahlAktenzeichen: { aktenzeichenNeu: true },
              },
              herstellerinformation: {
                herstellerDesProdukts: datatypeD("Foo").value,
                nameDesProdukts: datatypeD("Bar").value,
                version: datatypeC("Baz").value,
              },
            },
            grunddaten: {
              verfahrensdaten: {
                beteiligung: [
                  klaeger,
                  gesetzlicherVertreter,
                  beklagter,
                  prozessbevollmaechtiger,
                  zeuge,
                ],
              },
            },
            inhaltsdaten: {
              antraege: {
                sachantraege,
                nebenantraegeZinsen: {
                  inhalt: datatypeE("Lorem ipsum").value,
                },
                auswahlSonstigeAntraege: [
                  antragAufAnwaltskosten({
                    text: datatypeE(
                      "Die beklagte Partei traegt die aussergerichtlich angefallenen Anwaltskosten in Hoehe von 850.90 Euro.",
                    ).value,
                    fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
                    klaeger: rollennummerKlaeger,
                    beklagter: rollennummerBeklagter,
                    wertAnspruch: geldbetrag(850.9),
                  }),
                  antragAufVersaeumnisurteil(),
                  weitererAntrag(datatypeE("Weitere Antraege ...").value),
                ],
              },
              beweis: [beweisOfAZeuge, beweisOfAParteivernehmung],
              auswahlBegruendetheit: {
                anderesKlageverfahren: begruendetheit,
              },
            },
          });
        },
        xjustizToolsConnectionParameter,
      );

      expect(message).toMatchObject({ ok: true });
      expect(JSON.stringify(message)).toContain("<?xml version=");
    });
  });
}
