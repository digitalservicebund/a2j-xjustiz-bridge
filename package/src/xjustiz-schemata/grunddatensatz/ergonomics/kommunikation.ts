import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type Kommunikation } from "~/xjustiz-schemata/grunddatensatz/composites";
import { Telekommunikationsart } from "~/xjustiz-schemata/grunddatensatz/codelisten";

/**
 * Constructs a {@link Kommunikation} with {@link Telekommunikationsart.EMail}
 * as `telekommunikationsart`.
 */
export function email(address: DatatypeC): Kommunikation {
  return {
    verbindung: address,
    telekommunikationsart: Telekommunikationsart.EMail,
  };
}

/**
 * Constructs a {@link Kommunikation} with {@link Telekommunikationsart.Telefon}
 * as `telekommunikationsart`.
 */
export function telefon(number: DatatypeC): Kommunikation {
  return {
    verbindung: number,
    telekommunikationsart: Telekommunikationsart.Telefon,
  };
}
