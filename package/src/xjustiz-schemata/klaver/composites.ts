import {
  type Geldbetrag,
  type RefRollennummer,
  type Zinsen,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Anspruchsart } from "~/xjustiz-schemata/klaver/codelisten";
import { type DatatypeE } from "~/xjustiz-schemata/din-91379/datatypeE";
import { type FortlaufendeNummer } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";

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
};

export type Anspruch<NachrichtenScope> = {
  fortlaufendeNummer?: FortlaufendeNummer<NachrichtenScope, "Anspruch">;
  anspruchsteller?: RefRollennummer<NachrichtenScope>;
  anspruchsgegner?: RefRollennummer<NachrichtenScope>;
  anspruchsart?: Anspruchsart;
  wertAnspruch?: Geldbetrag;
};
