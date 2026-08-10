# ADR-0003: One Postgres instance, schema-per-service

## Status

Accepted

## Context

Multiple services (ADR-0002) will need persistence. Options ranged from one shared schema
(services reach into each other's tables), to a database-per-service, to a middle path. We
want real service data ownership without standing up per-service infrastructure on a solo
local setup.

## Decision

Run **one Postgres instance** with **one schema per service**. The Application Tracker owns
a `tracker` schema; each future service owns its own schema. No service reads or writes
another service's tables — cross-service data moves through service interfaces, not the DB.

## Consequences

- Each service has genuine data ownership (the microservice discipline that makes the
  polyglot services portfolio-credible), at the cost of one cheap local Postgres.
- Any schema can be promoted to its own database later with minimal disruption.
- Cross-service reads require a service call, not a JOIN — an intentional constraint.
