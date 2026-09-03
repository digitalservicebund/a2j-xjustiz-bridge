import { type DatatypeC } from "~/xjustiz-schemata/din-91379/datatypeC";

declare global {
  interface ImportMeta {
    readonly env: {
      /**
       * Injected version number as defined in the package.json file.
       */
      readonly PACKAGE_VERSION: DatatypeC;
    };
  }
}

export {}; // oxlint-disable-line unicorn/require-module-specifiers
