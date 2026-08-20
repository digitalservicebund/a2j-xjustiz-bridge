# Vale

[Related Decision Record](../decision-records/0007-check-technical-style-and-spelling-for-prose-with-vale.md)

[Vale](https://github.com/vale-cli/vale) is used for spellchecking and to
enforce a consistent technical style for our documentation. That includes also
comments in code. Furthermore, it lints for inclusive language and measures for
readability.

## Setup

We have a list of style packages configured for Vale. These are re-usable
community bundles that can be downloaded by Vale. This happens automatically
using the [workflow orchestrator](./task.md) on relevant tasks and when run
`task setup` initially.

## Ignoring External Style Packages

Vale mixes local and external styles into a single directory. It is not possible
to separate these. Therefore, it is important to put any external style package
we use into the respective [`.gitignore`](../../.vale/styles/.gitignore) file.

## German Spelling

Because we use bilingual spelling, it is necessary to extends the English
spellchecking by Vale. Therefore, a German dictionary have been added to the
repository in shape of Hunspell files. Vale automatically picks them up.

The Hunspell files have been downloaded from [woorm/dictionaries](https://github.com/wooorm/dictionaries)
on GitHub. They provide `UTF-8` converted dictionaries, which Vale requires.

This setup is not ideal. A preferred solution would be to install the
dictionaries into the development environment, instead of checking in these
rather large files into the repository. However, there are currently two issue
with this. First of all, the Nix package registry does not offer an `UTF-8`
version for Hunspell files at them moment. By research, there is also no public
Nix-Flake available as alternative reference. Furthermore, Vale seems to have
a bug reading the `DICPATH` environment variable. This variable is necessary to
have Vale recognize and find the dictionaries. Static `dicpath` configuration
property doesn't work, because of Nix it's content addressed paths that are
unstable cross machines and updates.

## How to Include Files for Linting

Vale is capable of linting various file-types. Especially for coding, it can
extract comments from many popular programming languages. This can also be
extended in multiple ways. The goal is to have Vale lint as much as possible in
the codebase. That means, we don't use an "allow list" like configuration.
Because this requires a contributor to recognize that a new file-type was added,
that might have Vale support. If this is missed, the new file-type won't be
linted. Instead, we opt to exclude files that should not be linted. That has the
positive effect, that Vale will just lint everything per default. If something
can not be linted or causes errors, because it should not be linted, it will pop
up automatically without the contributor having to remember it. This then allows
for pro-actively ignoring the respective file(type). Check out the existing
pattern in the [configuration file](../../.vale.ini) for a section that looks
somewhat like this `[!{*.lock,LICENSE}]` in extended form.

Vale does not provide a direct ignore mechanism like with an `.valeignore` file.

In consequence, it is not possible to just run Vale on the whole repository just
like `vale ./`. Vale is not aware of `.gitignore` files and will scan for
everything, including directories by package managers, the git database etc. To
have the whole repository being scanned, it is recommended to run the following
command `vale $(git ls-files)` instead. Or have it lint specific file lists like
for git hooks.

## Vocabulary

We use a custom vocabulary with words that should always be accepting by
spellchecking. Such include domain specific terms, (product) names, and plenty
of technical terminology. This can be somewhat annoying and is a common point of
frustration for automated quality assurance for documentation as code
practitioners. However, there is barely a way around this without dropping the
whole linting for spelling.

If such a word is encountered, add it to [the file](../../.vale/styles/config/vocabularies/XJustiz-Bridge/accept.txt)
with accepted terms. One entry per line. We deliberately try to keep this process
as less annoying as possible. Therefore, we use only a single list of terms for
everything. That creates the issue, that information why a term was added is not
transparent. For example, because it is a technical term like `sandboxing`. Or
because it should be an exception to [Alex
rules](#addressing-alex-profanity-unlikely-errors). However, this is a voluntary
trade-off to make it more bearable for contributors. In case of need, it is
possible to add lines of comments in an `accept.txt` file. But unfortunately no
comments can be appended after a term in a single line.

## Addressing Alex Profanity Unlikely Errors

Writing fully inclusive an avoid any insensitive, inconsiderate writing can be
challenging at first. We use a style package called `alex` to help us here.
However, its `alex.ProfanityUnlikely` rule can be too restricting. Or at least
conflicting with common technical terms. At first, it should be tried to avoid
reported terms. Common examples are `master`, `blacklist` etc. which already
have common new names in the industry. However, if there is term reported, that
should just be fine and there is no replacement without being incorrect, it can
be added to the [accepted vocabulary](#vocabulary) of the repository. For
example, "hooks" is just fine in the context of "git hooks" or just the term
"German".

Unfortunately, there can be rare confusion of German words like "die". Because
Alex is language unaware, this can only be added to add such an exception to the
vocabulary.

Example report:

```bash
documentation/example/file.md
54:7   warning    Be careful with 'hook',        alex.ProfanityUnlikely
                  it's profane in some cases.
```

## Missing Support for Ignore Files

Vale is not capable to take `.gitignore` files into account. Thereby, it is not
possible to have Vale discover files itself, without working on ignored files.
To get around that, an explicit list of files must be passed (for example via
`git ls-files`).
