import {
  type Anspruchsart,
  type AntragCodeliste,
} from "~/xjustiz-schemata/klaver/codelisten";
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
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type DatatypeD } from "~/xjustiz-schemata/din-91379/datatypeD";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type DateTime } from "~/xjustiz-schemata/xml-schema-definition/scalars";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type NachrichtKlaverKlageverfahren3500001 } from "~/xjustiz-schemata/klaver/nachricht-klaver-klageverfahren-3500001";
import { type Reference } from "~/xjustiz-schemata/shared-kernel/identifiers";
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
    sonstigeProzessualeAusfuehrungen?: AusfuehrungenFuerZahlungsklage;
    auswahlBegruendetheit: BegruendetheitFuerZahlungsklage<NachrichtenScope>;
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
    auswahlAktenzeichen: {
      aktenzeichenNeu: true;
    };
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
        anspruchssteller: [
          RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Klaeger>,
        ];
        anspruchsgegner: [
          RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Beklagter>,
        ];
        anspruchsart: typeof Anspruchsart.Zahlung;
        wertAnspruch: Geldbetrag;
      },
    ];
  };
  nebenantraegeZinsen:
    | undefined
    | {
        inhalt: DatatypeE;
        zinsanspruch: [
          {
            fortlaufendeNummer?: undefined;
            refFortlaufendeNummer: Reference<
              FortlaufendeNummer<NachrichtenScope, "Anspruch">
            >;
            zinsen: [Zinsen];
          },
        ];
      };
  auswahlSonstigeAntraege?: SonstigerAntragFuerZahlungsklage<NachrichtenScope>[];
};

export type SonstigerAntragFuerZahlungsklage<NachrichtenScope> =
  | AntragAufAnwaltskosten<NachrichtenScope>
  | AntragAufVersaeumnisurteil
  | WeitererAntrag;

export type AntragAufAnwaltskosten<NachrichtenScope> = {
  antragSonstige: {
    auswahlAntragSonstige: { sonstigerAntragTextform: DatatypeE };
    anspruch: [AnspruchFuerZahlungsklage<NachrichtenScope>];
  };
};

export type AntragAufVersaeumnisurteil = {
  antragSonstige: {
    auswahlAntragSonstige: {
      antragWerteliste: typeof AntragCodeliste.AntragAufVersaeumnisurteil;
    };
  };
};

export type WeitererAntrag = {
  antragSonstige: {
    auswahlAntragSonstige: { sonstigerAntragTextform: DatatypeE };
  };
};

type AnspruchFuerZahlungsklage<NachrichtenScope> = {
  fortlaufendeNummer: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
  anspruchssteller: [
    RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Klaeger>,
  ];
  anspruchsgegner: [
    RefRollennummer<NachrichtenScope, typeof Rollenbezeichnung.Beklagter>,
  ];
  anspruchsart: typeof Anspruchsart.Zahlung;
  wertAnspruch: Geldbetrag;
};

export type AusfuehrungenFuerZahlungsklage = {
  inhalt: {
    tatsachenvortragSachverhaltsbeschreibung: DatatypeC;
    rechtlicheWuerdigung?: DatatypeC;
  };
};

export type BegruendetheitFuerZahlungsklage<NachrichtenScope> = {
  anderesKlageverfahren: {
    vortrag: [
      VortragZurBegruendetheitFuerZahlungsklage<NachrichtenScope>,
      ...VortragZurBegruendetheitFuerZahlungsklage<NachrichtenScope>[],
    ];
  };
};

export type VortragZurBegruendetheitFuerZahlungsklage<NachrichtenScope> = {
  schlagwort: DatatypeC;
  vortragsID: UUID<NachrichtenScope>;
  ausfuehrungen: AusfuehrungenFuerZahlungsklage;
  fremdeVortragsID?: UUID<NachrichtenScope>[];
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
