# Devbox

[Related Decision Record](../decision-records/0004-use-reproducible-development-environment-with-devbox.md)

[Devbox](https://github.com/jetify-com/devbox) is used as package manager for
the reproducible development environment of the repository, providing the whole
toolchain from runtime, development environment, debuggers, linters, formatters,
security scanners, git hook manager, task orchestrator, POSIX utilities and
more. Check out the [section for the development environment](../../CONTRIBUTING.md#development-environment)
in the contribution guide to learn how to use it.

## Usage

The development environment can be set up for local development in two ways:
either directly in the shell or inside a container, offering DevContainer
integration. All the tools and their related setup are only available from
within the development environment.

### In the Shell

This requires to have a local Nix setup. The recommended way is to use
the universal [nix-installer](https://github.com/DeterminateSystems/nix-installer).
Notice that Nix is not a single binary but has a substantial footprint onto your
system. However, it is highly recommended. Afterward, Devbox itself must be
installed. Make sure to have a [matching
version](#ensure-matching-devbox-versions).

For single shot execution, the `devbox run <something>` command can be used. It
will automatically install everything missing and runs the given command inside
an up-to-date environment.

There are multiple ways to enter the development environment in the
command-line. The quickest approach is to run `devbox shell` to start a child
session in the current shell with the environment activated. Alternatively for
more control, `devbox generate direnv` provides a `.envrc` file that could be
automatically sourced, to make the environment available in the current shell
session. For both cases, you probably wanna use a setup that automatically
activates the environment when entering the repository.

Manually installing all packages based on the latest `devbox.json` (and
`devbox.lock`) can be done by running the `devbox install` command.

### DevContainer

Devbox can generate the full DevContainer configuration by running `devbox
generate devcontainer` and your DevContainer tooling takes it from there.

This approach avoids the need of a local Nix setup and instead relies on
container virtualization. DevContainers provide a well defined interface on top
of containers to allow for better integration in code editors. However, this
approach requires to run everything inside the container and does not allow
merging the development environment with the local shell setup.

## Scope

The development environment fills the gap between the programming language
specific package manager (e.g. `npm`, `cargo`, `nuget`) and the operation system
with its respective package manager capabilities (e.g. `apt`, `homebrew`,
`snap`).

The programming language specific package manager is responsible to install
application level dependencies that are used for compilation or running inside
tests. However, there is an exception of tooling that uses a plugin mechanisms
directly bound to the package manager. This is quite common on the NodeJS
platform, for example with ESLint or Vite. Such tools should not be installed
into the development environment because they won't properly work then.

The package manager of the development environment is responsible for every
tooling that is used inside the repository. That includes for example the
language specific package manager itself, including the development platform
with compilers and runtime. It also maintains the full list of quality assurance
tools like debuggers, linters, formatters, scanning tools, task orchestrators,
git hook managers and much more. This includes tooling used inside the
continuous integration pipelines. Furthermore, it is responsibly to maintain
a full list of GNU core utilities that are used (e.g. `coreutils`, `gnugrep`,
`gnused`) to improve the interoperability and to allow for better readable flag
arguments in scripts in the long version (e.g. `--in-place`,
`--extended-regexp`, `--verbose`).

The operation system and its package manager are responsible for everything
left. However, this should be a minimal set and should be documented. Usually
this includes tooling that requires certain privileges by the operation system
like for container runtimes. The shell to interpret commands belongs to this
scope as well for now, but is up for discussion as common source of frustration.

## Ensure Matching Devbox Versions

To improve compatibility, we try to fix the Devbox version. Therefore, Devbox
itself gets installed into the development environment as well. Hence, the to
use version is "documented" in the `devbox.json` file. It is also the version
that will be used within an active development environment. Thereby, any
modifications to the environment should always be applied from within it.
However, there is a bootstrap problem. The first initial installation requires
a machine local installation outside the environment. Furthermore, the same
installation is required to activate the development environment. It is the
responsibility of each contributor to have matching version installed on their
machine.

Furthermore, Devbox will be installed to the machines provided by the
[continuous integration service](./github-actions.md). The versions must match
to ensure integrity and reproducibility. A custom quality assurance check
automatically detects drift.

## Use Exact Package Versions

Instead of adding packages with an implicit "latest" version, specify an exact
version. For example, instead of just `devbox add git`, run `devbox add
git@2.53.0`. While the `devbox.lock` file theoretically captures the exact
version per hash, it is less explicit and more volatile. Also, the `devbox.json`
file acts as some kind of abstract documentation for the list of required tools
and their respective version. Furthermore, having versions in place makes
updates more explicit and visible. It also allows for better detection of
version updates by external tooling like Renovate.

## Don't Use Shell Scripts

We deliberately don't use Devbox is capability to define shell scripts. These
script are basically just shell aliases. We rather use our [central workflow
orchestrator](./task.md) and have Devbox focus on its core responsibility to
manage the toolchain.

## Don't Use Services

Devbox also provides the feature to define services inside the development
environment. We currently don't use this feature and it is unclear if it is
actually desirable to do so. When local services become a need, we should
probably evaluate the requirements and solution space, as Devbox might not be
the most sophisticated solution here.

## Don't Commit DevContainer Configuration

We deliberately don't commit the DevContainer configuration as we treat it as
generated output that doesn't belong into the source repository. It would also
required to be kept in sync with any Devbox related updates and changes.
Instead, the configuration can be generated by everyone locally using `devbox
generate devcontainer` and ignore it by git, adding `.devcontainer/` as an entry
to `.git/info/exclude`.
