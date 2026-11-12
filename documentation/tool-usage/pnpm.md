# Pnpm

[Related Decision Record](../decision-records/0017-use-pnpm-as-package-manager-for-runtime-dependencies.md)

[Pnpm](https://pnpm.io) is the package manager for runtime dependencies on the
NodeJS platform in this repository. It is complementary to the [reproducible
development environment](./devbox.md).

## Installation

Pnpm itself is only indirectly managed by the development environment of the
repository. We follow the recommended way of using the plugin by Devbox for
NodeJS with [Corepack](https://github.com/nodejs/corepack) to actually manage
the platform specific package manager - in our case pnpm. Therefore, we specify
and enforce the version inside the [`package.json`](../../package/package.json)
with the `packageManager` and `engines` properties. This will automatically take
effect when installing the development environment or on the next pnpm usage.

## Usage

Pnpm itself just be used directly as typical. However, it is also explicitly
wired into the usage with the [central workflow orchestrator](./task.md). The
`setup` task automatically installs runtime dependencies and building will also
take care of up-to-date node modules.

We explicitly do **not** use `scripts` within the `package.json` and have pnpm
run them. We deliberately stick to tasks with the workflow orchestrator, which
are also used in continuous integration pipelines.
