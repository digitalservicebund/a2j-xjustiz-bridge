# Zizmor

[Related Decision Record](../decision-records/0028-scan-ci-cd-workflows-for-security-issues-with-zizmor.md)

[Zizmor](https://zizmor.sh) is used to scan our continuous integration workflows
with [GitHub Actions](./github-actions.md) for security issues. Additionally, it
also audits the Dependabot configuration.

## GitHub Token for Online Audit Rules

Zizmor has some audit rules that work online, which require a GitHub access
token to work. For example, to detect impostor commits. Zizmor also has an
offline mode. In the continuous integration workflow, we always run in online
mode, explicitly passing the injected secret as token. Locally, it will try to
run the [`gh`](https://cli.github.com) command to obtain an authentication
token. However, Zizmor gracefully falls back to run offline in case no token is
available.

## Moved Caching

Per default, Zizmor uses a cache directory in the users home directory. For
consistency and uniformity, the cache has been moved into the repository. The
`.task` directory is the default of the repositories [workflow
orchestrator](./task.md) and already used by multiple other tasks.
