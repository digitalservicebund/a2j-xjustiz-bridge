# Lychee

[Related Decision Record](../decision-records/0008-check-link-validity-with-lychee.md)

[Lychee](https://github.com/lycheeverse/lychee) is used to find and verify links
in the codebase. This includes externals links like for websites, but also
internals or local links, often used between documents for documentation.

## Caching

Lychee is blazing fast, however we still use a cache that is valid for 1 day.
This also helps to reduce the limits on external sources. This does not apply to
local links, for example within documentation files.

The cache is persisted in the continuous integration environment too. Both the
push and nightly workflows use a date-based key of the form
`cache-lychee-YYYY-MM-DD-v1` with the restore prefix `cache-lychee-`. This
reuses validated external links during the day while allowing Lychee to check
them again on the following day.

## No Ignore File

Lychee supports the usage of a typical ignore file (`.lycheeignore`). However,
to avoid cluttering the root directory of the repository too much, we maintain a
list of `exclude`d links within the [configuration file](../../lychee.toml)
directly.
