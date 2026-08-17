/**
 * Type helper for sharing test variables.
 * Gives us autocomplete in our tests when using `inject(...)`.
 */

import { type ProvidedContext } from "vitest";
import { type StartedTestContainer } from "testcontainers";

declare module "vitest" {
  export interface ProvidedContext {
    /** The local URL for the Testcontainers while tests are running. */
    readonly xjustizToolsTestContainerUrl: string;
    readonly xjustizToolsContainerId: string;
  }
}
