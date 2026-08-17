// oxlint-disable-next-line vitest/no-importing-vitest-globals
import { afterAll, inject } from "vitest";
import { getContainerRuntimeClient } from "testcontainers";

// oxlint-disable-next-line vitest/require-top-level-describe, vitest/no-hooks, eslint/no-empty-pattern -- We are in the setup file
afterAll(async ({}, suite) => {
  const hasAnyTestFailed = suite.tasks.some(
    (task) => task.result?.state === "fail",
  );

  if (hasAnyTestFailed) {
    try {
      const runtimeClient = await getContainerRuntimeClient();
      const xJustizToolsContainer = runtimeClient.container.getById(
        inject("xjustizToolsContainerId"),
      );
      const containerLogs = await xJustizToolsContainer.logs({
        stdout: true,
        stderr: true,
      });
      console.error(containerLogs.toString());
    } catch (error) {
      console.error("Error fetching container logs:", error);
    }
  }
});
