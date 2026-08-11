/* oxlint-disable max-lines -- Example message fixture is comprehensive */
import {
  type AntraegeFuerZahlungsklage,
  type Beklagter,
  type GesetzlicherVertreter,
  type Klaeger,
  type Prozessbevollmaechtiger,
  type Zahlungsklage,
} from "~/nachricht/zahlungsklage/message-profile";
import {
  type FortlaufendeNummerGenerator,
  createFortlaufendeNummerGenerator,
} from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import {
  type RollennummerGenerator,
  createRollennummerGenerator,
} from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import {
  type ScopeToken,
  withScope,
} from "~/xjustiz-schemata/shared-kernel/scoping";
import {
  type UUIDGenerator,
  createUuidGenerator,
} from "~/xjustiz-schemata/grunddatensatz/uuid";

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
    context: Context<NachrichtenScope>,
  ) => Zahlungsklage<NachrichtenScope>,
): string {
  return withScope((scope) => {
    const context = createContext(scope);
    const message = compose(context);
    return JSON.stringify(message);
  });
}

type Context<NachrichtenScope> = {
  readonly nextFortlaufendeNummer: FortlaufendeNummerGenerator<NachrichtenScope>;
  readonly nextUUID: UUIDGenerator<NachrichtenScope>;
  readonly nextRollennummer: RollennummerGenerator<NachrichtenScope>;
};

function createContext<NachrichtenScope>(
  scope: ScopeToken<NachrichtenScope>,
): Context<NachrichtenScope> {
  return {
    nextFortlaufendeNummer: createFortlaufendeNummerGenerator(scope),
    nextUUID: createUuidGenerator(scope),
    nextRollennummer: createRollennummerGenerator(scope),
  };
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  // oxlint-disable-next-line max-lines-per-function
  describe("Zahlungsklage", async () => {
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

    // oxlint-disable-next-line max-lines-per-function
    it("is possible to create a valid example message", () => {
      const message = zahlungsklage(
        // oxlint-disable-next-line max-lines-per-function
        <NachrichtenScope>(context: Context<NachrichtenScope>) => {
          const klaeger = {
            rolle: [
              {
                rollennummer: context.nextRollennummer(
                  Rollenbezeichnung.Klaeger,
                ),
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
                referenz: [{ refRollennummer: klaeger.rolle[0].rollennummer }],
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

          const beklagter = {
            rolle: [
              {
                rollennummer: context.nextRollennummer(
                  Rollenbezeichnung.Beklagter,
                ),
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
                  { refRollennummer: beklagter.rolle[0].rollennummer },
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

          const sachantraege = {
            inhalt: datatypeE("Lorem ipsum").value,
            anspruch: [
              {
                fortlaufendeNummer: context.nextFortlaufendeNummer("Anspruch"),
                anspruchssteller: [
                  { refRollennummer: klaeger.rolle[0].rollennummer },
                ],
                anspruchsgegner: [
                  { refRollennummer: beklagter.rolle[0].rollennummer },
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
                refFortlaufendeNummer:
                  sachantraege.anspruch[0].fortlaufendeNummer,
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
                eigeneNachrichtenID: context.nextUUID(),
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
                          fortlaufendeNummer:
                            context.nextFortlaufendeNummer("Anspruch"),
                          anspruchssteller: [
                            {
                              refRollennummer: klaeger.rolle[0].rollennummer,
                            },
                          ],
                          anspruchsgegner: [
                            {
                              refRollennummer: beklagter.rolle[0].rollennummer,
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
                      vortragsID: context.nextUUID(),
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
