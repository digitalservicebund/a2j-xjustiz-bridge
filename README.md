# Access to Justice: XJustiz-Converter

> Assisted composition of XJustiz messages that are ensured to be valid.

The XJustiz-Converter is part of the project [Zugang zum
Recht](https://www.zugang-zum-recht-projekte.de/) (Access to Justice - A2J),
with the mission to empower citizens to learn about their rights and assert them
online. [XJustiz](https://xjustiz.justiz.de) is the public standard for the
exchange of legal data via the [Elektronischen
Rechtsverkehr](https://www.bundesjustizamt.de/DE/DasBfJ/Kontakt/Rechtsverkehr/Rechtsverkehr_node.html)
(electronic legal traffic). This allows citizens to file their claims with the
court online for example. To support the online services to participate in this
exchange, the XJustiz-Converter provides capabilities to compose messages in a
reliable manner.

> [!TIP]
> The domain language of the German justice system is German. As it is the
> ubiquitous language, there is a heavy mix of German domain terms surrounded by
> English. More on this in the related [design principles](./DESIGN_PRINCIPLES.md#german-domain-language).

## Motivation

Participating in the ERV (Elektronischer Rechtsverkehr) requires translating an
application's data model into the message schemata of the XJustiz standard. The
standard is complex and extensive, and composing a valid message for a specific
use case takes significant effort. Standalone XML schema validation only catches
errors after a complete document has been assembled — far too late in the
development cycle.

The XJustiz-Converter closes this gap. It brings the standard directly into the
application and TypeScript compiler, providing short feedback loops and catching
invalid data at the source — without requiring developers to become XJustiz
experts. A message that leaves the system is guaranteed to be valid.

## Standard Conformity

The XJustiz-Converter is currently exclusively supporting version
[3.6.2](https://xjustiz.justiz.de/XJustiz-Versionen/index.php#v362) of the
XJustiz Standard. However, it does not support the standard to its full extent.
Development is driven by the use cases of the [Onlinedienste der
Justiz](https://service.justiz.de). The goal is not an all-encompassing, generic
solution. But a focused solution that provides true value for the Onlinedienste.
More on this in our [design
principles](./DESIGN_PRINCIPLES.md#progressive-implementation-by-use-case).

## Getting Started

The [TypeScript library](./package/README.md) provides installation
instructions, usage examples, and API documentation.

## Documentation

As a good entry point, check out [CONTRIBUTING](./CONTRIBUTING.md) to learn how we
work, the basic repository structure and how to get started with the setup. See
the [architecture documentation](./documentation/architecture/README.md) to get
a high level view, where the XJustiz-Converter fits in the larger system, as
well as further references to more information. Our
[DESIGN_PRINCIPLES](./DESIGN_PRINCIPLES.md) describe our design approaches,
conventions, and other beliefs. Make also sure to check out our
[glossary](./GLOSSARY.md), documenting the ubiquitous language and terminology.
Any further documentation can be found within the
[documentation](./documentation/) directory. These include the product
requirements, decision records, tool usage, and more.

## Contributing

[Deutsche Sprache weiter unten](#mitwirken)

Everyone is welcome to contribute! You can contribute by giving feedback, adding issues, answering questions, providing documentation or opening pull requests. Please always follow the guidelines and our [Code of Conduct](./CODE_OF_CONDUCT.md).

To contribute code, open a pull request with your changes and it will be reviewed by someone from the team. By submitting a pull request you declare that you have the right to license your contribution to the DigitalService and the community under the license picked by the project.

## Mitwirken

Jede:r ist herzlich eingeladen, die Entwicklung des XJustiz-Converters mitzugestalten. Du kannst einen Beitrag leisten, indem du Feedback gibst, Probleme beschreibst, Fragen beantwortest, die Dokumentation erweiterst, oder Pull-Requests eröffnest. Bitte befolge immer die Richtlinien und unseren [Verhaltenskodex](CODE_OF_CONDUCT.md).

Um Code beizutragen erstelle einfach einen Pull Requests mit deinen Änderungen, dieser wird dann von einer Person aus dem Team überprüft. Durch das Eröffnen eines Pull-Requests erklärst du ausdrücklich, dass du das Recht hast deine Beitrag an den DigitalService und die Community unter der vom Projekt gewählten Lizenz zu lizenzieren.
