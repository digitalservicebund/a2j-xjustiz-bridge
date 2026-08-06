import {
  type InferCodeliste,
  defineCodeliste,
} from "~/xjustiz-schemata/shared-kernel/codelisten";

export type AnspruchsartCodeliste = InferCodeliste<
  typeof AnspruchsartCodeliste
>;
export const AnspruchsartCodeliste = defineCodeliste({
  Zahlung: "001",
});

export type AntragCodeliste = InferCodeliste<typeof AntragCodeliste>;
export const AntragCodeliste = defineCodeliste({
  AntragAufVersaeumnisurteil: "001",
});
