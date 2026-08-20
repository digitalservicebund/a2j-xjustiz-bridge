---
status: accepted
date: 2026-05-20
decision-makers: Malte Büttner
consulted: Kai Bernhard, Pram Gurusinga, Thore Straßburg, Christoph Böhmer
informed: A2J Platform team, BLK-AG IT-Standards
---

# Integrate with XJustiz-Tools

## Context and Problem Statement

The XJustiz-Tools are a bundle of utilities to work with XJustiz messages. It is
developed by the BLK-AG IT-Standards who is also responsible for the XJustiz
standard itself. They just released a new version they showcased to us in
a presentation. With the latest feature additions, it has become more
interesting to be used within the Access to Justice project.

The primary feature of interest is a JSON Schema version of the XJustiz
standard, translated from the official XML Schema Definition. With the focus on
JSON, it has the potential to make generating XJustiz messages as XML documents
more integrated for applications on the web platform with JavaScript. Just as
our Onlinedienste are.

The XJustiz-Tools are yet closed source and only a bundled Java Archive with the
service and some additional documentation has been shared privately. The self
declared goal by the BLK-AG IT-Standards is to become open-source when ready.

For deeper insights and more information, check out the [research for using the
XJustiz-Tools to generate XML messages](./research/xjustiz-tools-to-generate-xml-messages.md).
Because the XJustiz-Tools must be integrated as a service via network, the
[decision record to implement the XJustiz-Bridge as library] and its related
research is also relevant, as it is partially contrary.

## Decision Drivers

- Deeper cooperation with the BLK-AG IT-Standards.
- Support of the ecosystem and shared tooling around the XJustiz standard.
- Reducing complexity of the Onlinedienste to compose XJustiz messages.

## Decision Outcome

We use the XJustiz-Bridge to integrate with the XJustiz-Tools. We use their
JSON Schema as target data structure, having the tools convert it into validated
XML documents. It is the intend to support the developing digital systems around
the XJustiz standard and to work closer with the BLK-AG IT-Standards.

This requires us to host the XJustiz-Tools as a service as part of our
infrastructure for the service.justiz.de Onlinedienste. We have to work around
the current limitations of the proprietary software, with the hope that the
product becomes open-source soon. Our hope is that we can help and contribute
to improve the XJustiz-Tools to make them future proof. See [more information](#more-information)
for the planned handling of the new infrastructure.

### Consequences

- Good, because we anticipate deep cooperative work with the BLK-AG IT-Standards.
- Good, because we reuse a shared product of the XJustiz standard.
- Good, because using TypeScript, producing JSON output is generally less complex than XML.
- Neutral, because we have to address the issues of the JSON Schema.
- Neutral, because it is yet proprietary software that can cause friction and involves risks.
- Neutral, because this widens the surface of software handling sensitive user data.
- Bad, because we have to host the service and maintain infrastructure for it.
- Bad, because we originally tried to avoid the technical complexity that comes with integrating a service via network.

### Confirmation

When all optimism should not turn into value, but continuous frictions causes
too much additional work and costs, we can switch to our own XML serialization.
From the perspective of our current architecture, this just replaces the bottom
layer of our data flow. If circumstances require it, it should be feasible to
replace this layer and dissolve the infrastructure with the XJustiz-Tools
service.

## More Information

With the XJustiz-Tools service, the Court Communication team starts to maintain
its first own infrastructure. Therefore, we create a new private repository with
infrastructure as code along our company guidelines and templates of the
internal developer platform. This repository will be extended in future with
other planned services for the _Elektronischen Rechtsverkehr_. We intentionally
don't mix our infrastructure with the infrastructure by the A2J Platform.

Additionally, we create another private wrapper repository to provide a shim for
the XJustiz-Tools. We'll push the shared Java Archive into this repository,
complement it with the necessary files to package the service as an OCI image,
and add a continuous deployment pipeline to automatically build the images with
the necessary vulnerability scans. The resulting artifact will be published
privately and can be referenced by the infrastructure repository as usual. This
wrapper repository is intended to be temporarily, for the time before the
XJustiz-Tools become open-source and publish their own OCI images.
