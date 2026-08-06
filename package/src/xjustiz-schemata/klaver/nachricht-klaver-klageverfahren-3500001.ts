import {
  type Antrag,
  type Ausfuehrungen,
  type AuswahlBegruendetheit,
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
    sonstigeProzessualeAusfuehrungen?: Ausfuehrungen;
    auswahlBegruendetheit?: AuswahlBegruendetheit<NachrichtenScope>;
  };
};
