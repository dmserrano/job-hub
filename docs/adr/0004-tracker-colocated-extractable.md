# ADR-0004: Tracker wedge co-located in Next.js, behind an extractable boundary

## Status

Accepted

## Context

Given the microservices intent (ADR-0002), we had to decide whether the Application Tracker
is its own standalone backend service from the start, or co-located with its UI in the
Next.js app. Building service #1 as a separate service means writing HTTP plumbing to talk
to ourselves — premature ceremony.

## Decision

**Co-locate** the tracker's backend in the Next.js app (server actions / route handlers),
but keep **all tracker data access behind a single repository/service module boundary**, so
the tracker could be extracted into its own standalone service later without touching the
UI. Future polyglot services are separate from birth; the tracker does not need to be.

## Consequences

- Fastest path to a working wedge; no self-to-self HTTP.
- The internal boundary is load-bearing: UI must go through the tracker service module, not
  reach into the DB or ORM directly. Enforce this in code review.
- Extraction later is a mechanical lift-and-shift of that module behind an HTTP interface.
