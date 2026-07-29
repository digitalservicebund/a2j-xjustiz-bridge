import {
  type InferCodeliste,
  defineCodeliste,
} from "~/xjustiz-schemata/shared-kernel/codelisten";

export type Gericht = InferCodeliste<typeof Gericht>;
export const Gericht = defineCodeliste({
  BundesamtFuerJustiz: "A2000R",
});

export type Geschlecht = InferCodeliste<typeof Geschlecht>;
export const Geschlecht = defineCodeliste({
  Unbekannt: "0",
  Maennlich: "1",
  Weiblich: "2",
  Divers: "3",
  Saechlich: "4",
});

export type Kanzleiform = InferCodeliste<typeof Kanzleiform>;
export const Kanzleiform = defineCodeliste({
  Einzelanwalt: "001",
  Sozietaet: "002",
});

export type Rollenbezeichnung = InferCodeliste<typeof Rollenbezeichnung>;
export const Rollenbezeichnung = defineCodeliste({
  Beklagter: "028",
  GesetzlicherVertreter: "088",
  Klaeger: "101",
  Prozessbevollmaechtiger: "132",
});

export type Telekommunikationsart = InferCodeliste<
  typeof Telekommunikationsart
>;
export const Telekommunikationsart = defineCodeliste({
  EMail: "001",
  Telefon: "007",
});

export type Waehrung = InferCodeliste<typeof Waehrung>;
export const Waehrung = defineCodeliste({
  Euro: "EUR",
});

export type Zinsmethode = InferCodeliste<typeof Zinsmethode>;
export const Zinsmethode = defineCodeliste({
  JaehrlicherZinssatzUeberBasiszins: "002",
});
