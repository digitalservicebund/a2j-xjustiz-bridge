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
  type Gerichte,
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

export type NachrichtenkopfFuerZahlungsklage<NachrichtenScope> = {
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
      auswahlKommunikationspartner: { gericht: Gerichte };
    };
  };
  auswahlAktenzeichen: {
    aktenzeichenNeu: true;
  };
  herstellerinformation: Herstellerinformation;
};

export type GrunddatenFuerZahlungsklage<NachrichtenScope> = {
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

export type Klaeger<NachrichtenScope> = {
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

export type GesetzlicherVertreter<NachrichtenScope> = {
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

export type Beklagter<NachrichtenScope> =
  | BeklagtePerson<NachrichtenScope>
  | BeklagteOrganisation<NachrichtenScope>;

export type BeklagtePerson<NachrichtenScope> = {
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

export type BeklagteOrganisation<NachrichtenScope> = {
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

export type Prozessbevollmaechtiger<NachrichtenScope> = {
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

export type AntraegeFuerZahlungsklage<NachrichtenScope> = {
  sachantraege: {
    inhalt: DatatypeE;
    anspruch: [
      {
        fortlaufendeNummer: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
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
            fortlaufendeNummer?: undefined;
            refFortlaufendeNummer: FortlaufendeNummer<
              NachrichtenScope,
              "Anspruch"
            >;
            zinsen: [Zinsen];
          },
        ];
      };
};

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest;

  describe("Zahlungsklage", () => {
    it("[INCOMPLETE] is compatible to the base message Nachricht KLAVER Klageverfahren 3500001", () => {
      expectTypeOf<Zahlungsklage<unknown>>().toExtend<
        NachrichtKlaverKlageverfahren3500001<unknown>
      >();
    });
  });
}
