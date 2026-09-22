# Contributing

This document describes how we work, the basic structure and how to get started
with the repository.

## Getting Started

```bash
$ devbox run task setup
$ devbox run task --list
task: Available tasks for this project:
  # setup, check, fix, test, build, ...
```

The repository provides a reproducible development environment using Devbox.
Follow the [instructions](./documentation/tool-usage/devbox.md) to set up and
learn how to use it. In addition, the repository features a [central workflow
orchestrator](./documentation/tool-usage/task.md) called Task. It acts as
primary interface for developers and related infrastructure. The `setup` task
takes care of various minor chores, like setting up Git hooks, downloading
3rd party plugins, etc. to get started. Tasks with specific dependencies will
automatically ensure they are set up.

## Resolving Pull Requests

When working with a pull request, we prefer to resolve it with a rebase onto the
target branch to keep a clean and comprehensible history. Unfortunately does the
GitHub web user interface not provide a clean way to do so. For one part, it
always uses a merge commit after a rebase. For the second part, a rebase via the
web interface does not sign commits with the contributors key.

Therefore, we resolve pull requests manually from the local machine. To have
GitHub being fully aware of the process, follow the outlined steps. First of
all, the branch gets rebased onto the target branch (e.g. `main`). Then, this
must be force pushed to git remote. Afterward, fast-forward the target branch to
the branch of the pull request and push it. Finally, delete the branch of the
pull request. GitHub will recognize this and show the commit as successfully
"merged and closed".

A full chain of commands that ensure a clean target branch could look like this:

```bash
git switch some-target-branch
git pull --rebase
git switch some-feature-branch
git rebase some-target-branch
git push --force-with-lease
git switch some-target-branch
git merge --ff-only some-feature-branch
git push
git push --delete some-remote some-feature-branch
```
