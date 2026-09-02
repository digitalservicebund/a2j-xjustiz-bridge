// oxlint-disable import/no-nodejs-modules -- not part of production output
import { type TsdownInputOption, type UserConfig } from "tsdown";
import { basename, extname } from "node:path";
import { globSync } from "node:fs";

// oxlint-disable-next-line no-default-export -- required by tsdown
export default {
  dts: true,
  platform: "neutral",
  entry: {
    "nachricht/zahlungsklage": "./src/nachricht/zahlungsklage/index.ts",
    ...findEntriesForErgonomicModules(),
  },
  publint: true,
  define: {
    "import.meta.vitest": "undefined", // Strip in-source tests from output.
  },
} satisfies UserConfig;

function findEntriesForErgonomicModules(): Record<string, string> {
  const allErgonomicModules = globSync("./src/ergonomics/*.ts");

  return Object.fromEntries(
    allErgonomicModules.map((modulePath) => {
      const moduleName = basename(modulePath, extname(modulePath));
      const alias = `ergonomics/${moduleName}`;
      return [alias, modulePath];
    }),
  ) satisfies TsdownInputOption;
}
