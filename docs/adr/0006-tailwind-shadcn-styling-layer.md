# ADR-0006: Styling layer — Tailwind v4 + shadcn/ui + domain design tokens

## Status

Accepted

## Context

ADR-0005 settles the stack (Next.js + TypeScript + React) but is silent on how the UI is
styled. Until now the tracker's one page ran on a hand-written `globals.css` — a handful of
bespoke rules (`.stack`, `.field`, bare `table`/`button` element styling).

The remaining MVP screens are UI-heavy: a filterable/sortable table view, a detail view with
inline editing, date inputs for Next action, dropdowns and a dialog for quick-add. Hand-rolling
those means hand-rolling their accessibility too. Picking the styling layer now, while the
whole UI is a single page, makes the port nearly free; picking it after those screens land does
not.

Two things need deciding, and they are not the same thing:

1. **The generic 90%** — spacing, type, colour scales, and accessible component behaviour.
2. **The domain 10%** — what a `Status` looks like, and how urgency reads. No off-the-shelf
   library has an opinion about `Screen` versus `Interview`.

## Decision

**Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) + shadcn/ui (Radix base) for the
generic 90%, and a small set of domain tokens in a `@theme` block for the remaining 10%.**

- Tailwind alone is not a design system: it supplies scales and zero components.
- shadcn/ui copies component source into the repo over Radix primitives, themed by CSS
  variables. There is no component *runtime* dependency — `src/components/ui/**` is ours to
  edit, and is treated as first-party code.
- Only the components a screen actually uses get added; the registry is not bulk-imported.

### Domain tokens

`globals.css` carries a `@theme` block with one colour pair per `Status` — using the
`CONTEXT.md` glossary names verbatim — plus urgency emphasis tokens for **overdue**, **due
soon**, and **stale** (no activity ~7 days), which the Next-action and dashboard tickets will
consume.

`src/lib/design-tokens.ts` binds those tokens to the domain: `STATUS_TONE` is keyed by
`ApplicationStatus`, so the exported `APPLICATION_STATUSES` set drives the map rather than a
second hand-written list (CODING_STANDARDS, "constants named once"). Adding a Status is a type
error there. A unit test re-checks the two lists against each other, checks every token exists
in the stylesheet, and computes the actual WCAG contrast of each pair in both themes.

Colour is never the only signal: `StatusBadge` is the single way a Status renders, and it
always spells the Status out.

### Light and dark

Every palette token is declared **once**, as `light-dark(<light>, <dark>)`, and resolved by
`color-scheme`. shadcn's default output instead ships a `:root` block plus a `.dark` block,
which renders light-only until a theme-toggle runtime puts `.dark` on `<html>` — a regression
against the `color-scheme: light dark` the app already had. Declaring each token once follows
the OS today, keeps the two palettes from drifting, and still leaves the door open: a future
toggle only has to set `.dark` / `.light`, which flips `color-scheme` and every token with it.
The `dark` variant is redefined to fire on both the OS preference and the class, so shadcn's
own `dark:` utilities behave under either.

## Consequences

- Accessible primitives (dialog, select, date input, dropdown) arrive with the components
  rather than being hand-built per ticket — the payoff lands on #4, #6, #7 and #8.
- shadcn components are vendored source: upgrades are deliberate re-adds, not a version bump.
  One caveat on that: `globals.css` keeps shadcn's generated `@import "shadcn/tailwind.css"`,
  so the chosen style's base CSS is resolved from the `shadcn` package at build time rather
  than copied in. It is a dev dependency pinned by the lockfile, not a runtime one, but it does
  mean a `shadcn` bump can shift base styling — worth checking on upgrade.
- Radix's `Select` replaces the native one, so the status control needs hydration to open.
  Submitting before then omits `status`, which lands on the column's `Saved` default — the same
  value the trigger displays — so the form still agrees with itself. The text inputs are
  unaffected.
- `Urgency` (overdue / due soon / stale) was new vocabulary; it has been added to the
  `CONTEXT.md` glossary rather than left to drift.
- ESLint had to be configured for real (flat config, `eslint-config-next` pinned to the Next 15
  line) — `next lint` was deprecated and only ever dropped into an interactive setup prompt, so
  `pnpm lint` had never actually passed.
- The system font stack is kept as the theme's `--font-sans` rather than shadcn's Geist
  default, which would add a webfont fetch to every build for no benefit here.
- This extends ADR-0005 rather than contradicting it.

## Alternatives rejected

- **Pure hand-rolled Tailwind.** Defers an unavoidable design-system ticket and puts the
  accessibility of dropdowns, dialogs and date inputs on us, screen by screen.
- **Headless primitives only (Radix/Base UI, no shadcn).** Same styling work as pure
  hand-rolling, without shadcn's sensible defaults — and shadcn is only a copy-in layer over
  those very primitives, so it costs nothing extra.
