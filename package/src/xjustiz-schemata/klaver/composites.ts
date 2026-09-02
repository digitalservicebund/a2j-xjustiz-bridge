import {
  type Anspruchsart,
  type AntragCodeliste,
} from "~/xjustiz-schemata/klaver/codelisten";
import {
  type Geldbetrag,
  type RefRollennummer,
  type Zinsen,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type BeweisNummer } from "~/xjustiz-schemata/klaver/beweis-nummer";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type Reference } from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type Rollenbezeichnung } from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";

export interface Antrag<NachrichtenScope> {
  sachantraege?: {
    inhalt: DatatypeE;
    anspruch?: Anspruch<NachrichtenScope>[];
  };
  nebenantraegeZinsen?: {
    inhalt: DatatypeE;
    zinsanspruch?: {
      fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Zinsanspruch">;
      refFortlaufendeNummer?: Reference<
        FortlaufendeNummer<NachrichtenScope, "Anspruch">
      >;
      zinsen: Zinsen[];
    }[];
  };
  auswahlSonstigeAntraege?: SonstigerAntrag<NachrichtenScope>[];
}

export interface Anspruch<NachrichtenScope> {
  fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
  anspruchssteller?: RefRollennummer<NachrichtenScope>[];
  anspruchsgegner?: RefRollennummer<NachrichtenScope>[];
  anspruchsart?: Anspruchsart;
  wertAnspruch?: Geldbetrag;
  anspruchsgegenstand?: DatatypeC;
}

export interface SonstigerAntrag<NachrichtenScope> {
  antragSonstige: {
    auswahlAntragSonstige:
      | { antragWerteliste: AntragCodeliste }
      | { sonstigerAntragTextform: DatatypeE };
    anspruch?: Anspruch<NachrichtenScope>[];
  };
}

export interface Beweis<NachrichtenScope> {
  beweisNummer: BeweisNummer<NachrichtenScope>;
  auswahlBeweismittel:
    | {
        zeugen: RefRollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Zeuge
        >;
      }
    | {
        parteivernehmung: RefRollennummer<
          NachrichtenScope,
          typeof Rollenbezeichnung.Klaeger | typeof Rollenbezeichnung.Beklagter
        >;
      };
}

export interface Ausfuehrungen<Nachrichtenscope> {
  inhalt?: {
    tatsachenvortragSachverhaltsbeschreibung?: DatatypeC;
    rechtlicheWuerdigung?: DatatypeC;
  };
  refBeweisNummer?: Reference<BeweisNummer<Nachrichtenscope>>[];
}

export interface Vortrag<NachrichtenScope> {
  schlagwort: DatatypeC;
  vortragsID: UUID<NachrichtenScope>;
  ausfuehrungen: Ausfuehrungen<NachrichtenScope>;
  fremdeVortragsID?: UUID<NachrichtenScope>[];
}

export interface AuswahlBegruendetheit<NachrichtenScope> {
  anderesKlageverfahren: {
    vortrag: Vortrag<NachrichtenScope>[];
  };
}
