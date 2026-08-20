# Contextive

[Related Decision Record](../decision-records/0022-define-glossaries-with-contextive.md)
[Contextive](https://contextive.tech) is used smart glossaries, that are
available within the daily workflow. For example, with direct integration into
code editors. It is used to document the ubiquitous language and terminology.

## Setup

Contextive is actually not available via the development environment of this
repository. Unfortunately, there is no universal language server implementation
that is available as Nix package. Instead, it must be installed individually.
The most used integration is into code editors using their
[documentation](https://docs.contextive.tech/community/guides/installation) how
to install extensions and plugins.

Installing Contextive for an editor will provide extra documentation context in
hover hints, everywhere code symbols contain terms found in the glossary.

## Glossaries

Glossaries are just plain YAML files following a certain linked schema. Files
are discovered by their name using the `*.glossary.yaml` pattern. After all,
Contextive is not needed to read these files and make use of them. That is
especially the case for coding agents.

## Remote Usage

Contextive automatically picks up the glossaries it finds within the repository.
For remote usage, it is possible to reference the glossaries using the
[import](https://docs.contextive.tech/community/guides/setting-up-glossaries/#terms-defined-in-an-external-data-source)
configuration option. A minimal external glossary looks just like this:

`xjustiz.glossary.yaml`:

```yaml
imports:
  - https://github.com/digitalservicebund/a2j-xjustiz-bridge/tree/main/xjustiz.glossary.yaml
  # or with fixed release tag matching the installed library version (e.g. version 0.2.0):
  - https://github.com/digitalservicebund/a2j-xjustiz-bridge/tree/v0.2.0/xjustiz.glossary.yaml
```
