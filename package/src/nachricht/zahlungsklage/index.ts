export * from "./message-orchestrator";
export type * from "./message-profile";

// oxlint-disable-next-line oxc/no-barrel-file -- the intended structure for now
export * as ergonomics from "./ergonomics";

export {
  AntragCodeliste,
  Anspruchsart,
} from "~/xjustiz-schemata/klaver/codelisten";

export { createFortlaufendeNummerGenerator } from "~/xjustiz-schemata/klaver/fortlaufende-nummer";
export { createUuidGenerator } from "~/xjustiz-schemata/grunddatensatz/uuid";
export { createRollennummerGenerator } from "~/xjustiz-schemata/grunddatensatz/rollennummer";

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

export { type ScopeToken } from "~/xjustiz-schemata/shared-kernel/scoping";
