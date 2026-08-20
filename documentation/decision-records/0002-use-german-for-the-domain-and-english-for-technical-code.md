---
status: accepted
date: 2026-04-15
---

# Use German for the Domain and English for Technical Code

## Context and Problem Statement

The domain language of the German justice system is German. Many administrative
and legal terms lack precise English equivalents, or carry specific legal
meaning that gets lost or distorted in translation. At the same time, all
technical code, frameworks, and tooling conventions are English. Past attempts
to translate everything into English led to inconsistent terms, causing
confusion between developers and domain experts, and unnecessary cognitive
overhead. For the XJustiz-Bridge this is especially the case, because the
public XJustiz specification is in German too.

How should we handle the mix of German domain language and English technical
language in our codebase?

## Decision Outcome

Chosen option: "Hybrid approach", because it aligns the codebase with the
ubiquitous language of the domain while keeping technical code idiomatic.

Domain specific concepts stay in German. German umlauts are encoded as usual (ä
→ ae, ö → oe, ü → ue). If a domain term already has an established English name
used by domain experts themselves, that English term is kept as-is. The
technical implementation stays in English, surrounding the terms in German.

German gender-neutral language conventions (e.g., "Bürger:innen") are important
in public-facing communication but cannot be applied in code. Identifiers do not
support colons or similar punctuation. Attempting to encode these conventions in
typical camel, snake, or other case types (e.g., BuergerInnen) produces names
that are difficult to read. Especially when used in conjunction with more words
to compose function names for example. Domain terms in code should use the
simplest, most readable form of the word.

### Consequences

- Good, because developers and domain experts share the same ubiquitous language
- Good, because this reduces cognitive load
- Good, because it avoid potential bugs by code and domain diverging from each other
- Bad, because the mixed style can cause friction and may reduce open-source accessibility

## More Information

This decision is based on a company-wide sensible default, documented internally
with the title "Language in Code (using German or English words)".
