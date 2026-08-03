import {
  type Grunddaten,
  type Nachrichtenkopf,
} from "~/xjustiz-schemata/grunddatensatz/composites";
import { type Antrag } from "./composites";

export type NachrichtKlaverKlageverfahren3500001<NachrichtenScope> = {
  nachrichtenkopf: Nachrichtenkopf<NachrichtenScope>;
  grunddaten: Grunddaten<NachrichtenScope>;
  inhaltsdaten: {
    antraege?: Antrag<NachrichtenScope>;
  };
};
