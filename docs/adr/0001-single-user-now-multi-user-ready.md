# ADR-0001: Single-user now, multi-user-ready

## Status

Accepted

## Context

job-hub is initially for one user (the author's own job search), but there's a real desire
to open it to other job-seekers later. Building full multi-tenancy up front (auth, per-user
isolation, sessions) is weeks of work delivering zero value to the sole current user, and
would be guessing at requirements we don't have.

## Decision

Build single-user now, but avoid decisions that foreclose multi-user:

- **Owner-scope all data from day one.** Every user-owned record carries an `Owner`
  reference, hardcoded to a single user for now. Turning on real users later means giving
  that column meaning, not migrating every table.
- **Keep auth at the edge**, not woven through the app, so adding it later is one layer.
- **Use a real relational store** (Postgres) so multi-user is a scaling/deploy decision,
  not a rewrite.

## Consequences

- Near-zero cost today (a nullable-turned-real owner column + discipline).
- The multi-user future is a deploy + auth layer, not a re-architecture.
- Deferred: the actual auth mechanism and hosting — revisit when we go multi-user.
