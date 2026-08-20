# XJustiz-Tools to Generate XML Messages

The XJustiz-Tools are a bundle of utilities to work with XJustiz messages,
provided as a single service. Alternatively, it can be used directly as Java
library. The service is developed by the BLK-AG IT-Standards who are also
responsible for the XJustiz standard itself, with help by the Governikus GmbH
& Co. KG.

The service has become interesting in the context of the XJustiz-Bridge, as
it gained functionality that makes it potentially more effortless to compose
XJustiz messages. Just with their latest released version 1.1.1 from the 6th of
May 2026, they added support for the KLAVER module of the XJustiz standard. This
module is currently the most relevant one for the Access to Justice project.

The XJustiz-Tools are yet closed source and only a bundled Java Archive with the
service and some documentation has been shared privately. The self declared goal
by the BLK-AG IT-Standards is to become open-source when ready. The Court
Communication team has run the service locally for experimental testing and
inspected the OpenAPI specification with the included JSON Schema.

## Feature Set

The bundle of utilities includes a bunch of interesting features:

- Convert [xdomea](https://www.xoev.de/xdomea-19097) messages to XJustiz messages.
- Convert XJustiz messages to older or newer versions of the standard.
- Convert XJustiz messages in XML format to PDF files.
- Generate an XJustiz messages in XML format from a JSON dataset.
- Validate XJustiz messages for conformity to the standard.

In the context of the XJustiz-Bridge, the generation of XML documents from
JSON seems primarily interesting. The JSON format is much more integrated and
directly usable by the Onlinedienste written in the TypeScript programming
language. XML is not a first-class citizen in the JavaScript ecosystem and good
support is quite spare. In theory, the XJustiz-Tools could reduce the effort to
convert the user form data to XJustiz messages.

The validation endpoint appears to be of limited value. There are no hints of it
to apply any further validation but the XJustiz standards official XML Schema
Definitions and Schematron rules.

## Operational Aspects

Because the XJustiz-Tools are written in Java and the Onlinedienste in
TypeScript, the tools must be integrated as service via network requests, using
the exposed REST API via HTTP.

The service can be run without much effort. It just needs a Java Runtime
Environment version 17 or newer. It has only a few documented configuration
options and there is no additional infrastructure necessary like a database.
However, it requires to fetch relevant code lists from the
[XRepository](https://www.xrepository.de) and cache them in a local filesystem
directory. The service exposes a regular health endpoint, which comes in handy
when hosting the service in production.

## The JSON Schema of the API

As pointed out, the most interesting feature of the XJustiz-Tools is the
capability to generate XML documents from JSON datasets as input. However, the
primary task of the XJustiz-Bridge stays untouched: make it as straight
forward as possible to reliably translate user form data to messages of the
XJustiz standard for the Onlinedienste.

JSON Schema is a different schema description language than XML Schema
Definition. On a high level, both can describe the same schemata of the XJustiz
standard. Theoretically, JSON Schema is not capable enough to fully represent
what can be expressed with XML Schema Definitions. However, under the
restrictions of the XÖV standardization framework, this gap seems to fade.
Assuming equal capabilities of both schema description languages to represent
the standard, it comes down to the quality of the translation between the
schemata and related documents instances.

Because the official standard is developed and published using XML Schema
Definitions, the JSON Schema used for the API of the XJustiz-Tools will always
be secondary. An analysis of the schema has shown that it is a much more
permissive schema. For example, it doesn't fully communicate the requirements of
DIN norm 91379 data-types or restrictions of numeric data fields. In rare cases
there seem to be even small differences even in the data structure, like for
interest fees.

Furthermore, the API of the XJustiz-Tools took the interesting design decision
to support multiple versions of the standard at the same time. Though, not
separated by versioned API endpoints, but as a mix within the same schema for
the same endpoint. In practice this results in a permissive schema with plenty
of technical optional data fields. It requires the service user to consult the
documentation for each field to identify for which XJustiz version a field is
required or not, to compose an overall valid message payload.

After all, the JSON Schema can't be used standalone as it is. It requires
knowledge of the official XML Schema Definitions to compose fully correct JSON
payloads that can be converted to XML documents without runtime validation
errors.

## Versions of Code Lists

The XJustiz standards makes use of the so called [Codelisten](https://docs.xoev.de/x%C3%B6v-codelisten/%C3%BCbersicht)
by the XÖV standardization frame. Type 3 of these lists makes the sender of
a message responsible to choose a version of a specific list and send the
version as part of the message.

The XJustiz-Tools simplified this and removed the list versions from the JSON
Schema. Instead, the service automatically fetches the latest version of all
relevant lists every night. This comes in handy in a way that we on the sending
side can't run into the issue that we wanna use a code of a list in a newer
version than the XJustiz-Tools support. On the other side this might cause
friction for message receivers. What we learned from talking to them is, that
they struggle to keep up with the latest version of every code list in the
standard and process it properly semantic wise.
