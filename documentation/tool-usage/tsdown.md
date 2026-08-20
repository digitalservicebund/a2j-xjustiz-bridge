# Tsdown

[Related Decision Record](../decision-records/0018-bundle-the-library-with-tsdown.md)

[Tsdown](https://tsdown.dev) is used to bundle the XJustiz-Bridge TypeScript
library before publishing it to a package registry.

## Transpilation Target

Configurations like for the `target` and `format` are explicitly tailored along
the requirements of the A2J Platform. We also try to remain environment
independent without requirements on the NodeJS platform.
