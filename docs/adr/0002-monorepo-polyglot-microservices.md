# ADR-0002: Monorepo with polyglot microservices

## Status

Accepted

## Context

job-hub is planned as a multi-service tool. The first service (the Application Tracker) is
TypeScript/Next.js, but later services (interview study, job search/aggregation, AI-driven
suggested actions) may be written in other backend languages — partly as portfolio pieces
demonstrating different stacks. We need a repository layout that supports polyglot services
without team-scale coordination overhead (this is a solo project).

## Decision

Use a **monorepo** (pnpm workspaces + Turborepo). Each service lives in its own directory
with its own tooling; a service can be a completely different language. Shared TypeScript
types live in shared packages where useful.

## Consequences

- Atomic cross-service changes, one clone/run, shared types — the right trade for a solo dev.
- Polyrepo's isolation benefit (mainly a team concern) is given up; acceptable now.
- Each service still owns its own data (see ADR-0003), preserving service boundaries.
