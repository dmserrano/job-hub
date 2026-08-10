# Context: job-hub

A single-user (multi-user-*ready*) personal tool to support a job search. The first
service — the **wedge** — is an **Application Tracker**; later services (interview study,
job search/aggregation) hang off it.

## Product decisions (settled)

- **Single-user now, multi-user-ready.** Data is scoped by an `Owner` from day one
  (hardcoded to one user for now); auth is kept at the edge, not woven through. Deploying
  the app is what "turns on" real multi-user later.
- **Wedge = Application Tracker.** Build this first; it's useful standalone and becomes the
  spine other services plug into.
- **Pragmatic tool first.** Bias toward boring, proven, fast choices. Some services may
  double as portfolio pieces, but the tool earning its keep now comes first.
- **Form factor = web app**, run locally today, deployable later.

## Architecture decisions (settled — see `docs/adr/`)

- **Monorepo, polyglot.** One repo (pnpm workspaces + Turborepo). Future services may be
  written in other backend languages, each in its own directory. See ADR-0002.
- **Tracker wedge is co-located in the Next.js app**, behind a clean internal
  repository/service boundary so it can be extracted into its own service later without
  touching the UI. Other (polyglot) services are separate from birth. See ADR-0004.
- **Data ownership: one Postgres instance, schema-per-service.** The tracker owns a
  `tracker` schema; future services own their own schemas; no service reaches into
  another's tables. See ADR-0003.
- **Stack:** Next.js (App Router) + TypeScript + React, Drizzle ORM, Postgres in Docker.
  See ADR-0005.

## MVP scope (the wedge — Application Tracker)

**In:**
- Create an Application via a manual form (data-entry option (a)).
- **Table view** — filter + sort by status and next-action date. (Kanban board is a
  fast-follow, not MVP.)
- **Detail view** — edit fields, change Status, add Activity-log entries, edit Notes, set
  Next action.
- **Dashboard landing** — next actions due/overdue, applications needing attention (stale:
  no activity in ~7 days), and quick-add.

**Out (deferred, not foreclosed):** kanban board, URL-prefill on create, auth/login UI,
charts/analytics, comp reporting, and the other services below.

## Future services (planned, post-MVP)

The tracker is the spine; these hang off it.

- **Interview study** — flashcards / spaced repetition / practice questions; links to a
  Company/Application.
- **Job search / aggregation** — pull, filter, and surface listings; a found listing
  becomes a tracked Application.
- **Suggested Actions (AI-driven)** — observes the pipeline and recommends improvements
  (stalling applications, professional-development nudges, etc.); surfaces into the
  dashboard's "suggested actions" area. LLM service — grill and design when we reach it.

## Deferred decisions (not needed until later; boundaries above keep them open)

Hosting/deployment target, real auth mechanism, inter-service communication pattern
(sync/async, gateway), and shared cross-service auth. Revisit when service #2 arrives or we
deploy for multi-user.

## Glossary (ubiquitous language)

Use these exact terms in code, issues, tests, and UI. Don't drift to synonyms.

- **Application** — the central entity. One record per role being pursued. Owner-scoped.
- **Owner** — the user who owns a record. One hardcoded owner today; a real user later.
- **Company** — the hiring organization. Lightweight embedded fields on the Application for
  now (name, link); normalize into its own entity only if we need cross-Application views
  ("all roles at Company X").
- **Role** — the specific job: title, posting link, location, comp (if known). Also
  lightweight/embedded for now.
- **Status** — where an Application sits in the pipeline. One of:
  `Saved → Applied → Screen → Interview → Offer → Closed`.
  - **Screen** — the initial recruiter / phone screen, before formal interviews. Kept
    distinct from Interview on purpose (low-prep gatekeeping stage where many die).
  - **Closed** — terminal state covering rejected / withdrawn / ghosted, carrying a
    **reason**.
- **Activity log** — dated events that happened on an Application ("recruiter call 8/12").
  The timeline.
- **Next action** — the single thing owed on an Application, with an optional due date. The
  field that makes the tracker change behavior day to day.
- **Notes** — freeform, undated per-Application scratchpad (research, questions to ask, gut
  feelings, comp expectations). Distinct from the Activity log.

