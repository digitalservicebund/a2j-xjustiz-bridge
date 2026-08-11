import {
  type InferCodeliste,
  defineCodeliste,
} from "~/xjustiz-schemata/shared-kernel/codelisten";

export type Anspruchsart = InferCodeliste<typeof Anspruchsart>;
export const Anspruchsart = defineCodeliste({
  Zahlung: "001",
});

export type AntragCodeliste = InferCodeliste<typeof AntragCodeliste>;
export const AntragCodeliste = defineCodeliste({
  AntragAufVersaeumnisurteil: "001",
});
