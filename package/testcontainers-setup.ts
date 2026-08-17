import { GenericContainer, Wait } from "testcontainers";
import { type TestProject } from "vitest/node";

type SetupContext = {
  readonly provide: TestProject["provide"];
};

export async function setup({ provide }: SetupContext) {
  // Podman on macOS workaround for Ryuk container socket mounts
  process.env["TESTCONTAINERS_RYUK_DISABLED"] ??= "true";

  const startedContainer = await new GenericContainer(
    "ghcr.io/digitalservicebund/a2j-xjustiz-tools:latest",
  )
    .withExposedPorts(8888)
    .withWaitStrategy(Wait.forHttp("/actuator/health", 8888))
    .withReuse()
    .start();

  const xjustizToolsTestContainerUrl = `http://${startedContainer.getHost()}:${startedContainer.getMappedPort(8888)}`;

  provide("xjustizToolsTestContainerUrl", xjustizToolsTestContainerUrl);

  return async function teardown() {
    await startedContainer.stop();
  };
}
