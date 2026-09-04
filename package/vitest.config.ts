import { defineConfig } from "vitest/config";
import package_ from "./package.json" with { type: "json" };

// oxlint-disable-next-line no-default-export -- required by tsdown
export default defineConfig({
  test: {
    watch: false,
    env: {
      PACKAGE_VERSION: JSON.stringify(package_.version),
    },
    restoreMocks: true,
    projects: [
      {
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: "unit",
          includeSource: ["src/**/*.ts"],
          exclude: [
            "**/node_modules/**",
            "**/.git/**",
            "src/nachricht/zahlungsklage/message-orchestrator.ts",
          ],
        },
      },
      {
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: "integration",
          includeSource: [
            "src/nachricht/zahlungsklage/message-orchestrator.ts",
          ],
          exclude: ["**/node_modules/**", "**/.git/**"],
          globalSetup: ["./test/testcontainers-setup.ts"],
          setupFiles: ["./test/print-xjustiz-tools-logs-on-failure.ts"],
          hookTimeout: 50_000,
          testTimeout: 70_000,
          disableConsoleIntercept: false,
        },
      },
    ],
  },
});
