import {
  type Geldbetrag,
  type Grunddaten,
  type Nachrichtenkopf,
  type RefRollennummer,
  type Zinsen,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Anspruchsart } from "~/xjustiz-schemata/klaver/codelisten";
import { type DatatypeE } from "~/nachricht/zahlungsklage";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";

export type NachrichtKlaverKlageverfahren3500001<NachrichtenScope> = {
  nachrichtenkopf: Nachrichtenkopf;
  grunddaten: Grunddaten<NachrichtenScope>;
  inhaltsdaten: {
    antraege?: Antrag<NachrichtenScope>;
  };
};

export type Antrag<NachrichtenScope> = {
  sachantraege?: {
    inhalt: DatatypeE;
    anspruch?: Anspruch<NachrichtenScope>[];
  };
  nebebenantraegeZinsen?: {
    inhalt: DatatypeE;
    zinsanspruch?: {
      refFortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope>;
      zinsen: Zinsen[];
    }[];
  };
};

type Anspruch<NachrichtenScope> = {
  fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope>;
  anspruchsteller?: RefRollennummer<NachrichtenScope>;
  anspruchsgegner?: RefRollennummer<NachrichtenScope>;
  anspruchsart?: Anspruchsart;
  wertAnspruch?: Geldbetrag;
};
