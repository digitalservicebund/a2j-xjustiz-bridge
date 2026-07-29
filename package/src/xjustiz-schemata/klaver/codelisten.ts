import {
  type InferCodeliste,
  defineCodeliste,
} from "~/xjustiz-schemata/shared-kernel/codelisten";

export type Anspruchsart = InferCodeliste<typeof Anspruchsart>;
export const Anspruchsart = defineCodeliste({
  Zahlung: "001",
});

export type Antrag = InferCodeliste<typeof Anspruchsart>;
export const Antrag = defineCodeliste({
  AntragAufVersaeumnisurteil: "001",
});
