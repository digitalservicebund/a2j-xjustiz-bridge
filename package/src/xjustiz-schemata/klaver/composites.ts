import {
  type Anspruchsart,
  type AntragCodeliste,
} from "~/xjustiz-schemata/klaver/codelisten";
import {
  type Geldbetrag,
  type RefRollennummer,
  type Zinsen,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";

export type Antrag<NachrichtenScope> = {
  sachantraege?: {
    inhalt: DatatypeE;
    anspruch?: Anspruch<NachrichtenScope>[];
  };
  nebenantraegeZinsen?: {
    inhalt: DatatypeE;
    zinsanspruch?: {
      fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Zinsanspruch">;
      refFortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
      zinsen: Zinsen[];
    }[];
  };
  auswahlSonstigeAntraege?: SonstigerAntrag<NachrichtenScope>[];
};

export type Anspruch<NachrichtenScope> = {
  fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
  anspruchssteller?: RefRollennummer<NachrichtenScope>[];
  anspruchsgegner?: RefRollennummer<NachrichtenScope>[];
  anspruchsart?: Anspruchsart;
  wertAnspruch?: Geldbetrag;
  anspruchsgegenstand?: DatatypeC;
};

export type SonstigerAntrag<NachrichtenScope> = {
  antragSonstige: {
    auswahlAntragSonstige:
      | { antragWerteliste: AntragCodeliste }
      | { sonstigerAntragTextform: DatatypeE };
    anspruch?: Anspruch<NachrichtenScope>[];
  };
};

export type Ausfuehrungen = {
  inhalt?: {
    tatsachenvortragSachverhaltsbeschreibung?: DatatypeC;
    rechtlicheWuerdigung?: DatatypeC;
  };
};

export type Vortrag<NachrichtenScope> = {
  schlagwort: DatatypeC;
  vortragsID: UUID<NachrichtenScope>;
  ausfuehrungen: Ausfuehrungen;

  fremdeVortragsID?: UUID<NachrichtenScope>[];
};

export type AuswahlBegruendetheit<NachrichtenScope> = {
  anderesKlageverfahren: {
    vortrag: Vortrag<NachrichtenScope>[];
  };
};
