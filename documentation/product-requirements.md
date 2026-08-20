# Product Requirements

> [!IMPORTANT]
> This is a translated version of the [original internal document]. It is
> partially stripped down, simplified in structure and translated to English.

## Epic Description

Users of the service platform seek an uncomplicated way to digitally communicate
with the court and to send their data. The _Elektronische Rechtsverkehr (ERV)_
(translation: electronic legal traffic) is the current standard of the digital
communication and XJustiz is the data format for the exchange of structured data
within the justice. The XJustiz-Bridge converts the data specified in the
Onlinedienste into valid XJustiz messages (according to current standard).

Objective & Added value: Through the integration of the bridge we ensure that
received applications and specialized data can be imported directly into the
specialized procedures of the courts (e.g., via SAFE-ID) without manual
recording effort. This minimizes transmission errors, accelerates the processing
times and fulfills the legal requirements on the modern legal traffic.

## Business Outcome Hypothesis

- Valid XJustiz messages deliver structured data for courts, which
  (theoretically) can be processed automatically.
- Less manual work in the courts required.

## Leading Indicators

- The rate of incorrect conversions that block users and can't be fixed at runtime
  MUST be significantly below 1%.

## In Scope

- The bridge enables the effective transforming and translating of form data
  from the Onlinedienste into the corresponding module of the XJustiz standard, so
  it can be dispatched.
- The bridge MUST ensure that only valid XJustiz messages can be composed.
  The focus SHOULD be on the respective latest XJustiz version.
- The bridge MUST provide an imperative interface for synchronous
  request-response communication.

## Out of Scope

- The transmission of the data will be done separate from the bridge,
  including handling of necessary transfer parameter for the message container.

## Nonfunctional Requirements

- The conversion SHOULD be finished within 3 seconds for the user. The duration
  MUST stay below an upper limit of 10 seconds. This complies best practices of
  the industry and matches science research.
- The developer experience for the teams of the Onlinedienste MUST have priority
  to provide relief. The "Time To First Hello World" (TTFHW) SHOULD be below 10
  minutes. The "Time To First Value" (TTFV) can be more complex but SHOULD be
  within 1-2 days
- The bridge MUST be IT-Grundschutz and DSGVO conform, with respective
  concept documents.

## Solution Analysis

**Which Internal and/or external customers are affected, and how?**
Internal: Onlinedienste at service.justiz.de can use the XJustiz-Bridge to compose valid messages.
Internal: The ERV transmission system can transfer these messages.
External: Courts receive valid and structured data based on the current XJustiz standard

**What is the potential impact on solutions, programs, and services?**
Maybe the XJustiz utilities of the _AG IT Standards_.
Making the XJustiz-Bridge publicly available for external services.

**What is the potential impact on sales, distribution, deployment, and support?**
Maintenance and Monitoring

[original internal document]: https://docs.google.com/document/d/1-7-jyt_jOqsSlsXxcY4djpe-Ws_JggcM_b78txr5vw0/edit?usp=sharing
