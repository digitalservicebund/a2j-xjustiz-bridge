import {
  type Date,
  type DateTime,
  type Double,
} from "~/xjustiz-schemata/xml-schema-definition/scalars";
import {
  type Gericht,
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
import { type Rollennummer } from "~/xjustiz-schemata/grunddatensatz/rollennummer";
import { type UUID } from "~/xjustiz-schemata/grunddatensatz/uuid";

export type Nachrichtenkopf<NachrichtenScope> = {
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
  };
  auswahlAktenzeichen: {
    aktenzeichenNeu: true;
  };
  herstellerinformation: Herstellerinformation;
};

export type Grunddaten<NachrichtenScope> = {
  verfahrensdaten?: {
    beteiligung?: (Beteiligung<NachrichtenScope> | undefined)[];
  };
};

export type Kommunikationspartner = {
  auswahlKommunikationspartner: { gericht: Gericht } | { sonstige: DatatypeD };
};

export type Herstellerinformation = {
  nameDesProdukts: DatatypeD;
  herstellerDesProducts: DatatypeD;
  version: DatatypeC;
};

export type Beteiligung<NachrichtenScope> = {
  rolle?: Rolle<NachrichtenScope>[];
  beteiligter: Beteiligter;
};

export type Rolle<
  NachrichtenScope,
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung = Rollenbezeichnung,
> = {
  rollennummer?: Rollennummer<NachrichtenScope, ZugehoerigeRollenbezeichnung>;
  rollenbezeichnung: ZugehoerigeRollenbezeichnung;
  geschaeftszeichen?: DatatypeC;
  referenz?: RefRollennummer<NachrichtenScope>[];
};

export type Beteiligter = {
  auswahlBeteiligter:
    | { raKanzlei: RAKanzlei }
    | { natuerlichePerson: NatuerlichePerson }
    | { organisation: Organisation };
};

export type NatuerlichePerson = {
  vollerName: NameNatuerlichePerson;
  geschlecht?: Geschlecht;
  anschrift?: Anschrift[];
  beruf?: DatatypeC[];
  telekommunikation?: Kommunikation[];
  bankverbindung?: Bankverbindung[];
};

export type RAKanzlei = {
  bezeichnung: {
    bezeichnungAktuell: DatatypeD;
  };
  kanzleiform: Kanzleiform;
  anschrift?: Anschrift[];
  raImVerfahren?: NatuerlichePerson;
};

export type Organisation = {
  bezeichnung: {
    bezeichnungAktuell: DatatypeD;
  };
  anschrift?: Anschrift[];
};

export type NameNatuerlichePerson = {
  vorname?: DatatypeA;
  titel?: DatatypeC;
  nachname: DatatypeA;
};

export type Anschrift = {
  strasse?: DatatypeB;
  hausnummer?: DatatypeB;
  postleitzahl?: DatatypeC;
  ort?: DatatypeB;
};

export type Kommunikation = {
  telekommunikationsart: Telekommunikationsart;
  verbindung: DatatypeC;
};

export type Bankverbindung = {
  kontoinhaber?: DatatypeD;
  iban: DatatypeC;
};

export type RefRollennummer<
  NachrichtenScope,
  ZugehoerigeRollenbezeichnung extends Rollenbezeichnung = Rollenbezeichnung,
> = {
  refRollennummer: Rollennummer<NachrichtenScope, ZugehoerigeRollenbezeichnung>;
};

export type Geldbetrag = {
  zahl: Double;
  auswahlWaehrung: {
    waehrung: Waehrung;
  };
};

export type Zinsen = {
  zinssatz: Decimal;
  zinsmethode: Zinsmethode;
  zinsbeginn: Date;
};
