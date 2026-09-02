import {
  type Date,
  type DateTime,
  type Double,
} from "~/xjustiz-schemata/xml-schema-definition/scalars";
import {
  type Gerichte,
  type Geschlecht,
  type Kanzleiform,
  type Rollenbezeichnung,
  type Telekommunikationsart,
  type Waehrung,
  type Zinsmethode,
} from "~/xjustiz-schemata/grunddatensatz/codelisten";
import { type DatatypeA } from "~/xjustiz-schemata/din-91379/datatypeA";
import { type DatatypeB } from "~/xjustiz-schemata/din-91379/datatypeB";
import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type DatatypeD } from "~/xjustiz-schemata/din-91379/datatypeD";
import { type Decimal } from "~/xjustiz-schemata/xml-schema-definition/decimal";
import { type Reference } from "~/xjustiz-schemata/shared-kernel/identifiers";
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";
import { geldbetrag } from "./ergonomics/geldbetrag"; // oxlint-disable-line no-unused-vars -- referenced by TSDoc

export interface Nachrichtenkopf<NachrichtenScope> {
  xjustizVersion: "3.6.2";
  /*
   * This property is missing in the JSON schema definition, but included in
   * examples of the OpenAPI specification. It is definitely part of the XSD.
   */
  erstellungszeitpunkt: DateTime;
  absender: {
    informationen: Kommunikationspartner;
    eigeneNachrichtenID: UUID<NachrichtenScope>;
  };
  empfaenger: {
    informationen: Kommunikationspartner;
    auswahlAktenzeichen: {
      aktenzeichenNeu: true;
    };
  };
  herstellerinformation: Herstellerinformation;
}

export interface Grunddaten<NachrichtenScope> {
  verfahrensdaten?: {
    beteiligung?: (Beteiligung<NachrichtenScope> | undefined)[];
  };
}

export interface Kommunikationspartner {
  auswahlKommunikationspartner: { gericht: Gerichte } | { sonstige: DatatypeD };
}

export interface Herstellerinformation {
  nameDesProdukts: DatatypeD;
  herstellerDesProdukts: DatatypeD;
  version: DatatypeC;
}

export interface Beteiligung<NachrichtenScope> {
  rolle?: Rolle<NachrichtenScope>[];
  beteiligter: Beteiligter;
}

export interface Rolle<
  NachrichtenScope,
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung = Rollenbezeichnung,
> {
  rollennummer?: Rollennummer<NachrichtenScope, ZugehoerigeRollenbezeichnung>;
  rollenbezeichnung: ZugehoerigeRollenbezeichnung;
  geschaeftszeichen?: DatatypeC;
  referenz?: RefRollennummer<NachrichtenScope>[];
}

export interface Beteiligter {
  auswahlBeteiligter:
    | { raKanzlei: RAKanzlei }
    | { natuerlichePerson: NatuerlichePerson }
    | { organisation: Organisation };
}

export interface NatuerlichePerson {
  vollerName: NameNatuerlichePerson;
  geschlecht?: Geschlecht;
  anschrift?: Anschrift[];
  beruf?: DatatypeC[];
  telekommunikation?: Kommunikation[];
  bankverbindung?: Bankverbindung[];
}

export interface RAKanzlei {
  bezeichnung: {
    bezeichnungAktuell: DatatypeD;
  };
  kanzleiform: Kanzleiform;
  anschrift?: Anschrift[];
  raImVerfahren?: NatuerlichePerson;
}

export interface Organisation {
  bezeichnung: {
    bezeichnungAktuell: DatatypeD;
  };
  anschrift?: Anschrift[];
}

export interface NameNatuerlichePerson {
  vorname?: DatatypeA;
  titel?: DatatypeC;
  nachname: DatatypeA;
}

export interface Anschrift {
  strasse?: DatatypeB;
  hausnummer?: DatatypeB;
  postleitzahl?: DatatypeC;
  ort?: DatatypeB;
}

export interface Kommunikation {
  telekommunikationsart: Telekommunikationsart;
  verbindung: DatatypeC;
}

export interface Bankverbindung {
  kontoinhaber?: DatatypeD;
  iban: DatatypeC;
}

export interface RefRollennummer<
  NachrichtenScope,
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung = Rollenbezeichnung,
> {
  refRollennummer: Reference<
    Rollennummer<NachrichtenScope, ZugehoerigeRollenbezeichnung>
  >;
}

/**
 * Can be constructed ergonomically with the {@link geldbetrag} constructor
 * function.
 */
export interface Geldbetrag {
  zahl: Double;
  auswahlWaehrung: {
    waehrung: Waehrung;
  };
}

export interface Zinsen {
  zinssatz: Decimal;
  zinsmethode: Zinsmethode;
  zinsbeginn: Date;
}
