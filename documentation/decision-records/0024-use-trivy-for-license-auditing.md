---
status: proposed
date: 2026-07-29
---

# Use Trivy for License Auditing

## Context and Problem Statement

As the Court Communication team builds the XJustiz-Converter and maintains
infrastructure such as the OCI container images for the XJustiz-Tools, ensuring
software compliance is an important priority. We need an automated way to audit
licenses and provide visibility into the licenses of third-party dependencies
and container images used throughout our software supply chain.

Trivy is widely adopted for container image scanning in the company, and it
includes built-in capabilities for license scanning. Syft is another option for
container image scanning, Software Bill of Materials (SBOM) generation, and
license evaluation.

Which tool should we adopt to automate our license auditing?

## Decision Drivers

- Reliable extraction and identification of software licenses across project
  artifacts and third-party dependencies.
- Alignment with company-wide conventions and the Access to Justice project.
- Ability to enforce license compliance via automated checks in our GitHub
  Actions continuous integration pipelines.
- Minimizing toolchain complexity within our codebase.

## Considered Options

- Trivy
- Syft

## Decision Outcome

Chosen option: "Trivy", because it is already a widely used scanning tool in the
company and natively supports comprehensive license auditing. Adopting Trivy for
license compliance prevents the need to introduce and maintain a separate
toolchain for SBOM generation and license evaluation.

### Consequences

- Good, because we align with the company's established standards and reduce
  cognitive load for the team.
- Good, because we can utilize our existing, approved scanning tool for our
  license auditing workflows.
- Good, because Trivy allows us to fail the continuous integration pipelines
  when unauthorized licenses are detected.

## Pros and Cons of the Options

### Trivy

[Link to GitHub project](https://github.com/aquasecurity/trivy)

- Good, because it natively detects licenses across our specific Node.js and
  Java tech stack.
- Good, because it performs active compliance checks to block forbidden licenses
  without secondary tools.
- Good, because it classifies licenses into clear risk tiers based on the Google
  License Classification.
- Bad, because it was recently impacted by a highly sophisticated supply chain
  incident.

### Syft

[Link to GitHub project](https://github.com/anchore/syft)

- Good, because it can retrieve missing NPM license information from remote
  sources.
- Good, because it generally produces richer component metadata compared to
  Trivy.
- Bad, because it is solely an SBOM generator.
- Bad, because we would have to add another tools to actually evaluate the
  licenses found by Syft.
