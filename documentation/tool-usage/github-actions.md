# GitHub Actions

[Related Decision Record](../decision-records/0011-enforce-continuous-integration-with-github-actions.md)

[GitHub Actions](https://github.com/features/actions) is the continuous
integration service to centrally run our workflows to verify codebase integrity
with automated quality assurance and. Furthermore, it is used for time scheduled
workflows to frequently validate the codebase health (e.g. vulnerabilities).

Notice the confusion between "workflows" as higher level naming concept of
composed tasks by the [central workflow orchestrator](./task.md), which are
called by [GitHub Actions "workflows"](../../.github/workflows/) inside remote
environments.

## Manual Cache Versioning

All keys for our caches must be suffixed with a version number. The base key
should be composed by all relevant metadata to increase the likelihood of a
cache hit. The suffix is only for manual bumps for rare occasions, when a cache
hit causes issues. The standard format looks like this:

```yaml
key: some-name-${{ with.important }}-${{ information }}-v1
```

In case of a rare occasion, the suffix will be incremented. Here from `-v1` to
`-v2`.

There might be scenarios of pure manual cache management. In such case only the
manual increment will be used as key, here it would be `v1`.

## Restore Keys for Dependency Caches

A `restore-keys` prefix allows GitHub Actions to fall back to the most recent
compatible cache:

```yaml
key: runtime-dependencies-${{ hashFiles('./package/pnpm-lock.yaml') }}-v1
restore-keys: runtime-dependencies-
```

The prefix must only match caches with the same content and purpose.

## Concurrency Rules

It is recommended to always define a concurrency rule for each workflow. Because
one workflow can call another, it is necessary to use explicit `group` names. In
exact, avoid using `${{ github.workflow }}` for the group name. Because child
workflows inherit this variable, resulting into the exact same name as the
parent workflow. In consequence, the child workflow cancels the parent workflow
or puts itself into a ghost queue. Instead, just "copy" the original name of the
workflow literally to the group name. If they get out-of-sync its not a direct
issues.
