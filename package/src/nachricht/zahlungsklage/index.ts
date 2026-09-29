export * from "./message-orchestrator";
export type * from "./message-profile";

// oxlint-disable-next-line oxc/no-barrel-file -- the intended structure for now
export * as ergonomics from "./ergonomics";

export {
  AntragCodeliste,
  Anspruchsart,
} from "~/xjustiz-schemata/klaver/codelisten";

export { type Beweis } from "~/xjustiz-schemata/klaver/composites";

export {
  createBeweisNummerGenerator,
  type BeweisNummer,
} from "~/xjustiz-schemata/klaver/beweis-nummer";

export {
  createFortlaufendeNummerGenerator,
  type FortlaufendeNummer,
} from "~/xjustiz-schemata/klaver/fortlaufende-nummer";

export {
  Gerichte,
  Geschlecht,
  Kanzleiform,
  Rollenbezeichnung,
  Staaten,
  Telekommunikationsart,
  Waehrung,
  Zinsmethode,
} from "~/xjustiz-schemata/grunddatensatz/codelisten";

export {
  type Anschrift,
  type Bankverbindung,
  type Geldbetrag,
  type Kommunikation,
  type NatuerlichePerson,
  type Organisation,
  type RAKanzlei,
  type RefRollennummer,
} from "~/xjustiz-schemata/grunddatensatz/composites";

export {
  type UUID,
  createUuidGenerator,
} from "~/xjustiz-schemata/grunddatensatz/uuid";

export {
  type Rollennummer,
  createRollennummerGenerator,
} from "~/xjustiz-schemata/grunddatensatz/rollennummer";

export {
  type DatatypeA,
  datatypeA,
  join as joinDatatyeA,
} from "~/xjustiz-schemata/din-91379/datatype-a";

export {
  type DatatypeB,
  datatypeB,
  join as joinDatatyeB,
} from "~/xjustiz-schemata/din-91379/datatype-b";

export {
  type DatatypeC,
  datatypeC,
  join as joinDatatyeC,
} from "~/xjustiz-schemata/din-91379/datatype-c";

export {
  type DatatypeD,
  datatypeD,
  join as joinDatatyeD,
} from "~/xjustiz-schemata/din-91379/datatype-d";

export {
  type DatatypeE,
  datatypeE,
  join as joinDatatyeE,
} from "~/xjustiz-schemata/din-91379/datatype-e";

export {
  type Decimal,
  decimal,
} from "~/xjustiz-schemata/xml-schema-definition/decimal";

export {
  type Date,
  type DateTime,
  type Double,
} from "~/xjustiz-schemata/xml-schema-definition/scalars";

export {
  reference,
  type Reference,
} from "~/xjustiz-schemata/shared-kernel/identifiers";

export { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
