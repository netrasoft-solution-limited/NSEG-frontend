# ADR-0001: Four deployables until G4

- **Status:** Proposed — approver ADSPA
- **Date:** 2026-09-18
- **Baseline:** NATEP Gateway Solution Architecture v1.0 draft, AD-01

## Context

AD-01 specifies eighteen domain-aligned deployables: one per domain and one per Foundation
capability. It rejects two alternatives explicitly — fine-grained microservices, because they cost
too much to operate inside a 26-week schedule, and a single monolith, because a monolith cannot
enforce the rule that no service reads another domain's database.

The programme is starting with a pilot backend: real identity, real records, real decisions and a
real audit trail, built by a small team, running under Docker Compose before it runs on
Kubernetes. Eighteen deployables at this stage costs eighteen pipelines, eighteen images and
eighteen sets of health checks before a single officer decision is recorded.

## Decision

Four deployables until G4:

| Deployable | Modules |
|---|---|
| `users` | identity, registry, delegation |
| `foundation` | vault, consent, taxonomy, audit, notification, workflow |
| `domain` | demand, supply, regulatory, matching |
| `observatory` | indicator, reconciliation |

The eighteen services of AD-01 survive as **modules**, not as folders of convenience:

1. Each module owns **its own PostgreSQL schema and its own database role**. A module's role has
   privileges on its own schema only. A cross-module read fails at the database, not at review.
2. Each module reaches other modules through a **declared port**, never a repository or a shared
   entity. The port is the same interface whether the other module is in-process or across the
   network.
3. Each module has **its own outbox table**, written in the same transaction as its state change.
   The relay publishes in-process today and to Kafka later, with no change inside the module.
4. Each deployable holds **one database**, so a join across deployables is impossible even by
   accident.

User management is separated from the rest of Foundation because every other schema keys on
`actor_uaid`, its release cadence differs from the domains that consume it, and its security
review is its own.

## Consequences

Splitting a module out later is a deployment change: move the folder, point its client at a URL,
move its schema to another cluster. No code inside the module changes, because it was never
allowed to reach outside its own schema.

What this decision gives up, honestly stated:

- **Independent release per domain.** Two squads working in `domain` share a release. This is the
  trigger for splitting: when a squad is blocked by another squad's release, that module leaves.
- **Independent scaling per service.** Acceptable while load is pilot-scale.
- **Blast radius.** A fault in `demand` can take `supply` with it. Mitigated by module-level
  health checks and by the rule that a module never holds another module's transaction open.

## Triggers for splitting, before G4

Any one of these moves the module to its own deployable:

- A squad is blocked waiting on another squad's release.
- A module needs its own release gate (regulatory is the likely first: AD-08 separates it for
  exactly this reason, and it has a public read path).
- A module needs different scaling or a different runtime — matching, when scoring moves from
  rules to embeddings and the service becomes Python (AD-10).

## Compliance with the rest of the architecture

Unchanged: database per module with its own role (AD-02), thin events (AD-03), transactional
outbox (AD-04), Keycloak adopted (AD-05), TypeScript on NestJS (AD-10), open-source and
provider-neutral (AD-12).
