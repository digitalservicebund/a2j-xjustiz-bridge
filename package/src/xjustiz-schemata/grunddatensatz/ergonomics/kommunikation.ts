import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";
import { type Kommunikation } from "~/xjustiz-schemata/grunddatensatz/composites";
import { Telekommunikationsart } from "~/xjustiz-schemata/grunddatensatz/codelisten";

/**
 * Constructs a {@link Kommunikation} with `E-Mail` as `telekommunikationsart`.
 */
export function email(address: DatatypeC): Kommunikation {
  return {
    verbindung: address,
    telekommunikationsart: Telekommunikationsart["E-Mail"],
  };
}

/**
 * Constructs a {@link Kommunikation} with `Telefon` as `telekommunikationsart`.
 */
export function telefon(number: DatatypeC): Kommunikation {
  return {
    verbindung: number,
    telekommunikationsart: Telekommunikationsart.Telefon,
  };
}
