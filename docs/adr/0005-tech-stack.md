# ADR-0005: Tech stack — Next.js + TypeScript + Drizzle + Postgres

## Status

Accepted

## Context

The tracker is a web app (single-user now, multi-user-ready; pragmatic-first with portfolio
value). We need a stack that's fast for a solo dev, a strong portfolio surface, trivially
deployable (to unlock the multi-user future), and boring/proven.

## Decision

- **Next.js (App Router) + TypeScript + React** for the app (UI + co-located tracker
  backend per ADR-0004).
- **Drizzle ORM** for type-safe data access, with **drizzle-kit** migrations.
- **Postgres**, run locally in **Docker** for development.

## Consequences

- One language front-to-back; large ecosystem; deployment (e.g. Vercel + hosted Postgres)
  is what "turns on" multi-user later.
- This ADR governs the tracker service. Other polyglot services (ADR-0002) choose their own
  stacks; only the schema-per-service data-ownership rule (ADR-0003) binds them.
