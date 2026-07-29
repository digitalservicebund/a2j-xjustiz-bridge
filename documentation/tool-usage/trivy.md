# Trivy

[Related Decision Record](../decision-records/0024-use-trivy-for-license-auditing.md)

[Trivy](https://github.com/aquasecurity/trivy) is used in this repository for
automated license auditing and compliance checking across our dependencies and
codebase.

## Usage Through Task

In alignment with our workflow orchestration patterns, Trivy commands are
encapsulated within our central task orchestrator (e.g., `task check:license`).
This ensures that license auditing runs identically in local development
environments and in continuous integration pipelines.

### CLI Options

By combining `--exit-code 1` with `--severity HIGH,CRITICAL`, the command
automatically returns a non-zero exit code to fail the pipeline if it detects
"Restricted" or "Forbidden" licenses. This behavior relies on Trivy's use of the
Google License Classification, which specifically maps "Restricted" licenses to
a `HIGH` severity and "Forbidden" licenses to a `CRITICAL` severity. Finally,
the `--include-dev-deps` flag ensures that development dependencies are actively
audited alongside production runtime dependencies.

## Exceptions and Overrides

If a flagged license is evaluated and determined to be an acceptable exception,
it can be documented in a `.trivyignore` file. This file should be placed in the
root of the repository.
