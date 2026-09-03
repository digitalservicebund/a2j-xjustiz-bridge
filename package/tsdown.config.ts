import { type UserConfig } from "tsdown";
import package_ from "./package.json" with { type: "json" };

// oxlint-disable-next-line no-default-export -- required by tsdown
export default {
  dts: true,
  platform: "neutral",
  entry: {
    "nachricht/zahlungsklage": "./src/nachricht/zahlungsklage/index.ts",
  },
  publint: true,
  env: {
    PACKAGE_VERSION: JSON.stringify(package_.version),
  },
  define: {
    "import.meta.vitest": "undefined", // Strip in-source tests from output.
  },
} satisfies UserConfig;
