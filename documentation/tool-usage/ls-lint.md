# Ls-Lint

[Related Decision Record](../decision-records/0029-enforce-consistent-file-naming-with-ls-lint.md)

[Ls-lint](https://ls-lint.org) is a static analysis tool as part of our quality
assurance. It enforces consistent file and directory naming. All naming rules
are defined in the [configuration file](../../.ls-lint.yml) and enforced via the
`check:file-and-directory-names` [task](./task.md).

## Limitations

It is not possible to have `ls-lint` enforce the existence of certain files or
directories. It only analysis what exists in the filesystem. While this is
a different story, it is possible to restrict the number of existing files
matching a certain pattern.
