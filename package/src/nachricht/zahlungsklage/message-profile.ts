// oxlint-disable max-lines -- current test of full message is super long
import {
  type Geldbetrag,
  type Herstellerinformation,
  type NatuerlichePerson,
  type Organisation,
  type RAKanzlei,
  type RefRollennummer,
  type Zinsen,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import {
  type Gericht,
  type Rollenbezeichnung,
} from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type Anspruchsart } from "~/xjustiz-schemata/klaver/codelisten";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type DatatypeD } from "~/xjustiz-schemata/din-91379/datatypeD";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type DateTime } from "~/xjustiz-schemata/xml-schema-definition/scalars";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type NachrichtKlaverKlageverfahren3500001 } from "~/xjustiz-schemata/klaver/nachricht-klaver-klageverfahren-3500001";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";
import { type WithScope } from "~/xjustiz-schemata/shared-kernel/scoping";

/*
 * !!!CAREFUL!!!
 *
 * Message profiles must sub-schema of their base XJustiz-Nachricht schema.
 * Proving so is actually a trickier and more complex task than it initially
 * appears. The current implementation is highly based on carefully curation
 * work. Not all mistakes are currently caught at compile-time for this step.
 *
 * Technical debt to resolve:
 *   - compiler check for sub-schema to improve security
 *   - utility types for efficient overriding to improve maintainability
 */

export type Zahlungsklage<NachrichtenScope> = {
  nachrichtenkopf: NachrichtenkopfFuerZahlungsklage<NachrichtenScope>;
  grunddaten: GrunddatenFuerZahlungsklage<NachrichtenScope>;
  inhaltsdaten: {
    antraege: AntraegeFuerZahlungsklage<NachrichtenScope>;
  };
};

type NachrichtenkopfFuerZahlungsklage<NachrichtenScope> = {
  xjustizVersion: "3.6.2";
  erstellungszeitpunkt: DateTime;
  absender: {
    informationen: {
      auswahlKommunikationspartner: { sonstige: DatatypeD };
    };
    eigeneNachrichtenID: UUID<NachrichtenScope>;
  };
  empfaenger: {
    informationen: {
      auswahlKommunikationspartner: { gericht: Gericht };
    };
  };
  auswahlAktenzeichen: {
    aktenzeichenNeu: true;
  };
  herstellerinformation: Herstellerinformation;
};

type GrunddatenFuerZahlungsklage<NachrichtenScope> = {
  verfahrensdaten: {
    beteiligung:
      | [Klaeger<NachrichtenScope>, Beklagter<NachrichtenScope>]
      | [
          Klaeger<NachrichtenScope>,
          GesetzlicherVertreter<NachrichtenScope>,
          Beklagter<NachrichtenScope>,
        ]
      | [
          Klaeger<NachrichtenScope>,
          Beklagter<NachrichtenScope>,
          Prozessbevollmaechtiger<NachrichtenScope>,
        ]
      | [
          Klaeger<NachrichtenScope>,
          GesetzlicherVertreter<NachrichtenScope>,
          Beklagter<NachrichtenScope>,
          Prozessbevollmaechtiger<NachrichtenScope>,
        ];
  };
};

type Klaeger<NachrichtenScope> = {
  rolle: [
    {
      rollennummer: Rollennummer<
        NachrichtenScope,
        typeof Rollenbezeichnung.Klaeger
      >;
      rollenbezeichnung: typeof Rollenbezeichnung.Klaeger;
    },
  ];
  beteiligter: {
    auswahlBeteiligter: {
      natuerlichePerson: NatuerlichePerson;
    };
  };
};

type GesetzlicherVertreter<NachrichtenScope> = {
  rolle: [
    {
      rollenbezeichnung: typeof Rollenbezeichnung.GesetzlicherVertreter;
      geschaeftszeichen?: DatatypeC;
      referenz: [
        RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Klaeger>,
      ];
    },
  ];
  beteiligter: {
    auswahlBeteiligter: {
      raKanzlei: RAKanzlei;
    };
  };
};

type Beklagter<NachrichtenScope> =
  | BeklagtePerson<NachrichtenScope>
  | BeklagteOrganisation<NachrichtenScope>;

type BeklagtePerson<NachrichtenScope> = {
  rolle: [
    {
      rollennummer: Rollennummer<
        NachrichtenScope,
        typeof Rollenbezeichnung.Beklagter
      >;
      rollenbezeichnung: typeof Rollenbezeichnung.Beklagter;
    },
  ];
  beteiligter: {
    auswahlBeteiligter: {
      natuerlichePerson: NatuerlichePerson;
    };
  };
};

type BeklagteOrganisation<NachrichtenScope> = {
  rolle: [
    {
      rollennummer: Rollennummer<
        NachrichtenScope,
        typeof Rollenbezeichnung.Beklagter
      >;
      rollenbezeichnung: typeof Rollenbezeichnung.Beklagter;
    },
  ];
  beteiligter: {
    auswahlBeteiligter: {
      organisation: Organisation;
    };
  };
};

type Prozessbevollmaechtiger<NachrichtenScope> = {
  rolle: [
    {
      rollenbezeichnung: typeof Rollenbezeichnung.Prozessbevollmaechtiger;
      referenz: [
        RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Beklagter>,
      ];
    },
  ];
  beteiligter: {
    auswahlBeteiligter: {
      natuerlichePerson: NatuerlichePerson;
    };
  };
};

type AntraegeFuerZahlungsklage<NachrichtenScope> = {
  sachantraege: {
    inhalt: DatatypeE;
    anspruch: [
      {
        fortlaufendeNummer: FortlaufendeNummer<NachrichtenScope>;
        anspruchsteller: RefRollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Klaeger
        >;
        anspruchsgegner: RefRollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Beklagter
        >;
        anspruchsart: typeof Anspruchsart.Zahlung;
        wertAnspruch: Geldbetrag;
      },
    ];
  };
  nebebenantraegeZinsen:
    | undefined
    | {
        inhalt: DatatypeE;
        zinsanspruch: [
          {
            refFortlaufendeNummer: FortlaufendeNummer<NachrichtenScope>;
            zinsen: [Zinsen];
          },
        ];
      };
};

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

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
    const { createUuidGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/uuid"
    );
    const { createRollennummerGenerator } = await import(
      "~/xjustiz-schemata/grunddatensatz/rollennummer"
    );
    const {
      Gericht,
      Geschlecht,
      Kanzleiform,
      Rollenbezeichnung,
      Telekommunikationsart,
      Waehrung,
      Zinsmethode,
    } = await import("~/xjustiz-schemata/grunddatensatz/codelisten");
    const { createFortlaufendeNummerGenerator } = await import(
      "~/xjustiz-schemata/klaver/fortlaufende-nummer"
    );
    const { Anspruchsart } = await import(
      "~/xjustiz-schemata/klaver/codelisten"
    );
    const { withScope } = await import(
      "~/xjustiz-schemata/shared-kernel/scoping"
    );

    it("[INCOMPLETE] is compatible to the base message Nachricht KLAVER Klageverfahren 3500001", () => {
      expectTypeOf<Zahlungsklage<unknown>>().toExtend<
        NachrichtKlaverKlageverfahren3500001<unknown>
      >();
    });

    // oxlint-disable-next-line max-lines-per-function
    it("is possible to create a valid example message", () => {
      // oxlint-disable-next-line max-lines-per-function
      withScope(<Scope>(scope: WithScope<Scope>) => {
        const nextUUID = createUuidGenerator(scope);
        const nextRollennummer = createRollennummerGenerator(scope);
        const nextFortlaufendeNummer = createFortlaufendeNummerGenerator(scope);

        const klaeger = {
          rolle: [
            {
              rollennummer: nextRollennummer(Rollenbezeichnung.Klaeger),
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
                    verbindung: datatypeC("max.mustermann@mustermail.de").value,
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
        } satisfies Klaeger<Scope>;

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
        } satisfies GesetzlicherVertreter<Scope>;

        const beklagter = {
          rolle: [
            {
              rollennummer: nextRollennummer(Rollenbezeichnung.Beklagter),
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
        } satisfies Beklagter<Scope>;

        const prozessbevollmaechtiger = {
          rolle: [
            {
              rollenbezeichnung: Rollenbezeichnung.Prozessbevollmaechtiger,
              referenz: [{ refRollennummer: beklagter.rolle[0].rollennummer }],
            },
          ],
          beteiligter: {
            auswahlBeteiligter: {
              natuerlichePerson: {
                vollerName: { nachname: datatypeA("Erika Mustermann").value },
              },
            },
          },
        } satisfies Prozessbevollmaechtiger<Scope>;

        const sachantraege = {
          inhalt: datatypeE("Lorem ipsum").value,
          anspruch: [
            {
              fortlaufendeNummer: nextFortlaufendeNummer(),
              anspruchsteller: {
                refRollennummer: klaeger.rolle[0].rollennummer,
              },
              anspruchsgegner: {
                refRollennummer: beklagter.rolle[0].rollennummer,
              },
              anspruchsart: Anspruchsart.Zahlung,
              wertAnspruch: {
                zahl: 5000,
                auswahlWaehrung: {
                  waehrung: Waehrung.Euro,
                },
              },
            },
          ],
        } satisfies AntraegeFuerZahlungsklage<Scope>["sachantraege"];

        const nebebenantraegeZinsen = {
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
        } satisfies AntraegeFuerZahlungsklage<Scope>["nebebenantraegeZinsen"];

        const message = {
          nachrichtenkopf: {
            xjustizVersion: "3.6.2",
            erstellungszeitpunkt: Temporal.Now.instant(),
            absender: {
              informationen: {
                auswahlKommunikationspartner: {
                  sonstige: datatypeD("Herr Dr. Max Mustermann").value,
                },
              },
              eigeneNachrichtenID: nextUUID(),
            },
            empfaenger: {
              informationen: {
                auswahlKommunikationspartner: {
                  gericht: Gericht.BundesamtFuerJustiz,
                },
              },
            },
            auswahlAktenzeichen: { aktenzeichenNeu: true },
            herstellerinformation: {
              herstellerDesProducts: datatypeD("Foo").value,
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
              nebebenantraegeZinsen,
            },
          },
        } satisfies Zahlungsklage<Scope>;

        return JSON.stringify(message);
      });
    });
  });
}
