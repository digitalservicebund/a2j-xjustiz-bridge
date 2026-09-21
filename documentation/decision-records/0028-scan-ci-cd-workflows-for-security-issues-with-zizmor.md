---
status: accepted
decision-makers: Thore Straßburg, Pram Gurusinga
date: 2026-09-21
---

# Scan CI/CD Workflows for Security Issues with Zizmor

## Context and Problem Statement

Our CI/CD workflows are implemented for the GitHub Actions continuous
integration service. We already integrate with `actionlint` as static analysis
tool. However, this does not cover security concerns. We had issues in the past,
where permissions where not set correctly, causing pipeline runs to fail.
Furthermore, we have the highly sensible company requirement to pin used
Actions and referenced workflows. So we need to extend our quality assurance to
scan for security issues more reliable.

Which analysis tool should we use to scan our CI/CD workflows for security issues?

## Decision Drivers

- Detect properly broad or missing `permissions` settings
- Enforces pinning of Actions and reusable workflows
- Complements actionlint instead of overlapping with it
- Runs locally and in continuous integration

## Decision Outcome

Chosen option: "[Zizmor](https://zizmor.sh)", because it
is purpose-built for auditing the security posture of GitHub Action
workflows, covering exactly the permission and pinning issues `actionlint`
does not check. Additionally, it provides audits for Dependabot as well.

### Consequences

- Good, because it helps to cover against security issues
- Good, because it enforces the company rule for pinning
- Good, because it provides minimal extra audits for Dependabot
- Neutral, because it adds another tool and might cause noise
