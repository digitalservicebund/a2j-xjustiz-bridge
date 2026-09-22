# Task

[Related Decision Record](../decision-records/0009-orchestrate-workflows-centrally-with-task.md)

[Task](https://github.com/go-task/task) (also called `go-task` or `Taskfile`) is
the central workflow orchestrator of the repository. It provides tasks and
workflows that can be used for local development, to check in code into the
version control system, for continuously integration pipelines, releases, and
deployments. Workflows run static code analysis tools and scanner, execute
tests, build applications, generate artifacts, and publish releases.

The orchestrator is meant to cover the full operation cycle. For example, to fix
the structural formatting of files. It works for of a single file from inside
a code editor, for a list of staged files from the command-line, and to verify
the correct formatting of the whole codebase within a continuous integration
pipeline.

Other infrastructure tools like git hook managers or continuous integration
services must use these workflows. In consequences they become more focused on
their core competencies. Workflows remain independent, can be run locally and
can be debugged straight forward.

In combination with the development environment, it creates strong cross machine
compatibilities - heavily reducing "works on my machine" scenarios.

## Usage

Task is automatically available within the [development environment](./devbox.md)
and should be used in conjunction with it. Running `task --list` will provide an
overview of available tasks and their descriptions. For example: `task
check:format`.

It is most convenient to use Task with autocompletion on the command-line. This
way, tasks can be discovered and run quicker. Therefore, Task provides the `task
--completion <some_shell>` command. Depending on the individual local setup,
this can be just sourced into the shell, for example like `source <(task
--completion zsh)`. There are also extensions for popular code editors that can
be installed.

Some tasks support a list of files as argument, to limit their radius of their
action. Like formatting only given set of files instead of the whole codebase.
For example: `task fix -- README.md Taskfile.yml`. Tasks should indicate by their
description if they support such a file list argument.

Tasks should include their required setup automatically. So any workflow can be
called without implicit preconditions. For example, runtime dependencies will be
installed before an application is build. Exception is the development
environment itself. Updates to it will be detected and installed automatically,
but require to rerun the actual task to have updates taking effect. This can be
avoided by running `devbox run task ...`, as this will always ensure that the
environment is up to date first and then run Task in this environment.

From a technical perspective, everything in Task is a task. Workflows are a meta
concept, describing tasks that compose a bunch of other tasks.

## Task Taxonomy and Scopes

To maintain a predictable and self-documenting CLI experience, all tasks are
categorized and grouped into a hierarchy of scopes. Tasks are named by their
chain of scopes, for example `scope-a:scope-b:scope-c`. While `scope-b` is
a sub-scope of `scope-a` and `scope-c` is a sub-scope of `scope-b`. Practical
examples would be `check:format` or `fix:format`. Sometimes, the final scope is
just the name of the tool that is run by this task, like
`check:format:prettier`. Each scope can be run individually. So running `check`
will run any sub-scope task of itself in parallel. In turn also `check:format`
will run only run sub-scoped tasks of itself. These are implicit, lightweight
workflows.

The full task name should read as imperative command, starting with a verb
followed by a noun like `check:format` or `fix:format`. Developers should be
able to guess the impact of a task based on the naming (e.g. read-only `check`
versus modifying `fix`). Tool names should be excluded. They might only be used
as last the last scope if it becomes necessary to manage complexity. Such tasks
should usually be marked as `internal: true` to keep the list of suggested tasks
short.

The tiered hierarchy of scopes looks like the following:

**ensure:\***
Internal gatekeepers for prerequisites to _ensure_ the system meets the
requirements for a higher level task.
_Example_: `ensure:development-environment`

**setup:\***
Bootstrapping tasks, often downloading artifacts, that are cached to set up
the tooling or environment for a higher level task.
_Example_: `setup:vale`

**check:\***
Read-only validation by static analysis tools that fail on noncompliance,
reporting detected issues. Should be silent if no issues detected.
_Example:_ `check:format`

**fix:\***
Modifying files by fixing issues that can be automatically resolved.
_Example:_ `fix:format`

**test:\***
Running executable test suites to dynamically verify business logic, fitness
functions etc.
_Example:_ `test:end-to-end`

**build:\***
Assemble various kind of artifacts from source code via compilation, bundling, etc.
_Example_: `build:library`

**publish:\***
Distribute built artifacts, for example by publishing to a registry, often
requiring secrets or authentication tokens.
_Example:_ `publish:library`

**verify:**
High level composed workflows to verify staged changes or for continuous
integration pipelines.
_Example:_ `verify:staged-changes`

## Setup Task Dependencies

Various tasks usually depend on certain setup tasks. Multiple tasks depend on
the same setup. Therefore, setup tasks should always set the option `run: once`.
Thereby, the same setup task will only run once before all other tasks that
depend on it. The task orchestrator can properly resolves the task dependency
graph. Without this option set, the same setup task will run multiple times,
potentially concurrently, causing race issues. Especially when combined with
caching, like having a `sources` option defined.

## Keep Check Tasks Silent

The main `check` task is one of the most important ones. It groups a big chunk
of static analysis tools as part of the quality assurance. Too much output
creates noise, that makes it troublesome to see the actual issues. In case
everything is alright, this task should be silent. Only issues are reported.
This requires to find the correct parameters of a tool to tweak its output. In
rare cases, custom scripting in the tasks definition is necessary.

## Tasks Working on File Lists

Tasks that `check` or `fix` something should read list of files from
command-line arguments. The most trivial version to do so is by passing
something like `{{ .CLI_ARGS | default .ROOT_DIR }}` as argument to a tool,
when defining a task. For tools that require a file pattern, this could be
changed to `{{ .CLI_ARGS | default "**/*.ext" }}` as example.

When the tool depends on a list filtered by file extension, the following
pattern can be used:

```yaml
tasks:
  check:example:
    vars:
      FILES: '{{ .CLI_ARGS_LIST | join "\n" }}' # The advantage of CLI_ARGS_LIST versus CLI_ARGS is proper shell escape sequence parsing
      FILTERED_FILES: '{{ regexFindAll "(?m)^.*\\.ext$" .FILES -1 | join " " }}' # Go RE2 expression matching per line.
    if: "{{ empty .FILES | or (not (empty .FILTERED_FILES)) }}" # Skip if nothing left after filtering.
    cmd: example '{{ .FILTERED_FILES | default <some_default> }}'
```

Some tools are not capable to take all `.gitignore` files into account. In such
a case the global `.ALL_PROJECT_FILES` variable can be used. With a growing
codebase, we might run into character length restrictions for commands in
future. A possible fix will be to use `xargs` to resolve the limit.
