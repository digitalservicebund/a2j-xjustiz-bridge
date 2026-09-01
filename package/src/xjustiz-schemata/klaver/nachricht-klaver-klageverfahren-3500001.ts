import {
  type Antrag,
  type Ausfuehrungen,
  type AuswahlBegruendetheit,
  type Beweis,
} from "./composites";
import {
  type Grunddaten,
  type Nachrichtenkopf,
} from "~/xjustiz-schemata/grunddatensatz/composites";

export type NachrichtKlaverKlageverfahren3500001<NachrichtenScope> = {
  nachrichtenkopf: Nachrichtenkopf<NachrichtenScope>;
  grunddaten: Grunddaten<NachrichtenScope>;
  inhaltsdaten: {
    antraege?: Antrag<NachrichtenScope>;
    beweis?: Beweis<NachrichtenScope>[];
    sonstigeProzessualeAusfuehrungen?: Ausfuehrungen<NachrichtenScope>;
    auswahlBegruendetheit?: AuswahlBegruendetheit<NachrichtenScope>;
  };
};
