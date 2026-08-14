// oxlint-disable max-lines
import {
  type AntraegeFuerZahlungsklage,
  type Beklagter,
  type GesetzlicherVertreter,
  type Klaeger,
  type Prozessbevollmaechtiger,
  type Zahlungsklage,
} from "~/nachricht/zahlungsklage/message-profile";
import {
  type ScopeToken,
  withScope,
} from "~/xjustiz-schemata/shared-kernel/scoping";

/**
 * Message orchestrator to compose a Nachricht for a _Zahlungsklage_.
 *
 * This message type is based on the XJustiz KLAVER module, using the generic
 * message type `nachricht.klaver.klageverfahren.3500001` with the
 * specialization of an `anderes Klageverfahren`.
 *
 * **ATTENTION:**
 * This is still under construction. Not all constraints are verified yet.
 * Also, the resulting message is in the intermediate JSON serialization,
 * instead of as an XML document.
 */
export function zahlungsklage(
  compose: <NachrichtenScope>(
    scope: ScopeToken<NachrichtenScope>,
  ) => Zahlungsklage<NachrichtenScope>,
): string {
  return withScope((scope) => {
    const message = compose(scope);
    return JSON.stringify(message);
  });
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("Zahlungsklage", async () => {
    const { reference } = await import(
      "~/xjustiz-schemata/shared-kernel/identifiers"
    );
    const { decimal } = await import(
      "~/xjustiz-schemata/xml-schema-definition/decimal"
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
      Waehrung,
      Zinsmethode,
    } = await import("~/xjustiz-schemata/grunddatensatz/codelisten");
    const { AntragCodeliste, Anspruchsart } = await import(
      "~/xjustiz-schemata/klaver/codelisten"
    );
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );

    // oxlint-disable-next-line max-lines-per-function
    it("is possible to create a valid example message", () => {
      const message = zahlungsklage(
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
                  vollerName: { nachname: datatypeA("Erika Mustermann").value },
                },
              },
            },
          } satisfies Prozessbevollmaechtiger<NachrichtenScope>;

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
                wertAnspruch: {
                  zahl: 5000,
                  auswahlWaehrung: {
                    waehrung: Waehrung.Euro,
                  },
                },
              },
            ],
          } satisfies AntraegeFuerZahlungsklage<NachrichtenScope>["sachantraege"];

          const nebenantraegeZinsen = {
            inhalt: datatypeE("Lorem ipsum").value,
            zinsanspruch: [
              {
                refFortlaufendeNummer: reference(fortlaufendeNummerAnspruch),
                zinsen: [
                  {
                    zinssatz: decimal(0.05).value,
                    zinsmethode: Zinsmethode.JaehrlicherZinssatzUeberBasiszins,
                    zinsbeginn: Temporal.Now.plainDateISO(),
                  },
                ],
              },
            ],
          } satisfies AntraegeFuerZahlungsklage<NachrichtenScope>["nebenantraegeZinsen"];

          const uuid = createUuidGenerator(scope);
          const eigeneNachrichtenID = uuid.first();
          const fortlaufendeNummerAnwaltskosten = fortlaufendeNummer.next(
            fortlaufendeNummerAnspruch,
            "Anspruch",
          );
          const vortragsID = uuid.next(eigeneNachrichtenID);

          return {
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
                    gericht: Gerichte["Bundesamt für Justiz"],
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
                ],
              },
            },
            inhaltsdaten: {
              antraege: {
                sachantraege,
                nebenantraegeZinsen,
                auswahlSonstigeAntraege: [
                  {
                    antragSonstige: {
                      auswahlAntragSonstige: {
                        sonstigerAntragTextform: datatypeE(
                          "Die beklagte Partei traegt die aussergerichtlich angefallenen Anwaltskosten in Hoehe von 850.90 Euro.",
                        ).value,
                      },
                      anspruch: [
                        {
                          fortlaufendeNummer: fortlaufendeNummerAnwaltskosten,
                          anspruchssteller: [
                            {
                              refRollennummer: reference(rollennummerKlaeger),
                            },
                          ],
                          anspruchsgegner: [
                            {
                              refRollennummer: reference(rollennummerBeklagter),
                            },
                          ],
                          anspruchsart: Anspruchsart.Zahlung,
                          wertAnspruch: {
                            zahl: 850.9,
                            auswahlWaehrung: {
                              waehrung: Waehrung.Euro,
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    antragSonstige: {
                      auswahlAntragSonstige: {
                        antragWerteliste:
                          AntragCodeliste.AntragAufVersaeumnisurteil,
                      },
                    },
                  },
                  {
                    antragSonstige: {
                      auswahlAntragSonstige: {
                        sonstigerAntragTextform: datatypeE(
                          "Weitere Antraege ...",
                        ).value,
                      },
                    },
                  },
                ],
              },
              auswahlBegruendetheit: {
                anderesKlageverfahren: {
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
                      },
                    },
                  ],
                },
              },
            },
          };
        },
      );

      expect(message).toBeDefined();
    });
  });
}
