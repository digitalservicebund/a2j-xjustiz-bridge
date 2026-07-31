# Trivy

[Related Decision Records](../decision-records/0024-use-trivy-for-license-auditing.md),
[0025](../decision-records/0025-use-trivy-for-vulnerability-scanning.md)

[Trivy](https://github.com/aquasecurity/trivy) is used in this repository for
automated license auditing, vulnerability scanning, and compliance checking
across our dependencies and codebase.

## Caching

To keep Trivy fast in both local development and GitHub Actions, the repository
pins `TRIVY_CACHE_DIR` to `./.task/cache/trivy` in its Task definitions. This
gives both environments the same cache location relative to the repository root.

Locally, the database persists on disk across repeated Task runs as long as the
workspace remains intact. In GitHub Actions, the same directory is restored and
saved via `actions/cache`. The scheduled nightly workflow uses a date-based cache
key of the form `cache-trivy-YYYY-MM-DD-v1` together with the restore prefix
`cache-trivy-`. The `YYYY-MM-DD` portion follows the original Trivy action cache
update example, which emits the date in `%Y-%m-%d` format. That allows cache
reuse across runs on the same day while still falling back to older Trivy
database caches when no cache exists yet for the current date.

## Usage Through Task

In alignment with our workflow orchestration patterns, Trivy commands are
encapsulated within our central task orchestrator (e.g., `task check:license`
or `task check:vulnerability`). This ensures that Trivy scans run identically
in local development environments and in continuous integration pipelines.

### CLI Options

Both repository tasks combine `--exit-code 1` with `--severity HIGH,CRITICAL`
so they fail the pipeline automatically when Trivy reports findings at those
levels. For `task check:license`, this behavior relies on Trivy's use of the
Google License Classification, which maps "Restricted" licenses to a `HIGH`
severity and "Forbidden" licenses to a `CRITICAL` severity. For `task
check:vulnerability`, the same severity threshold is used to block the
integration of dependencies with high or critical known CVEs. Finally, the
`--include-dev-deps` flag ensures that development dependencies are scanned
alongside production runtime dependencies.

## Exceptions and Overrides

If a flagged license or vulnerability is evaluated and determined to be an
acceptable exception, it can be documented in a `.trivyignore` file. This file
should be placed in the root of the repository.
