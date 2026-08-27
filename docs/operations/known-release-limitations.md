# Known Release Limitations

| Field        | Value         |
| ------------ | ------------- |
| Status       | Open blockers |
| Last updated | 2026-08-27    |

## Public-Release Blockers

1. No hosting provider, domain, DNS configuration, or public deployment environment has been selected.
2. HTTPS cannot be validated with a real certificate until a domain and deployment provider are selected.
3. The repository license, privacy disclosure, and terms of service are intentionally undecided.
4. A production observability collector, dashboards, alerts, retention policy, and on-call ownership are not selected.
5. Firefox and Edge have not received physical-browser compatibility validation.
6. The compatibility matrix still requires final French physical-browser observations on the approved Chrome/Safari desktop and phone environments.

## Accepted MVP Boundaries

- Temporary identities are not registered accounts and do not provide account administration, password reset, or social moderation.
- One API instance is the supported reference topology. Rate limiting is process-local; horizontal scaling requires a shared implementation.
- Capacity evidence is a reproducible local baseline, not an Internet-facing service-level guarantee.
- The project has no WAF, payment handling, native mobile client, formal penetration test, or ASVS certification.

## Resolution Rule

No public launch or public readiness claim may be made while a public-release blocker remains open. Each resolution requires a documented decision, implementation evidence where applicable, and Yasmany's approval.
