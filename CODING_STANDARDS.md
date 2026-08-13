# Coding Standards

How code is written in this repo, on top of what tooling (`tsc`, ESLint, Prettier)
already enforces — don't restate rules a formatter or the type-checker catches.
The `/code-review` Standards axis reads this file; a rule here overrides the
generic code-smell baseline.

Architecture decisions live in `docs/adr/` and the ubiquitous language in
`CONTEXT.md`; this file is about day-to-day code shape.

## Single source of truth — don't repeat a concept

When the same logic, shape, or value already exists somewhere, reuse it rather
than re-writing it. A second copy is a second thing to keep in sync, and they
drift. This covers three common cases:

### 1. Reused logic → extract it

If the same non-trivial logic appears in more than one place, pull it into a
shared function (a `utils` helper, a service method, a hook) and call it from
both. Applies the moment you're about to copy-paste-and-tweak.

- Extract on the **second** occurrence, not the first — one use isn't a pattern,
  and premature abstraction (Speculative Generality) is its own smell.
- Extract the shared *shape*, not a near-match forced together: if two blocks
  only look similar, leave them. Coincidental duplication is not duplication.

### 2. Derived types → derive them, don't re-declare

When a type is a variant of another (a create/update input, a DTO, a partial
view of a domain type), **derive it** with `Pick` / `Omit` / `Partial` / mapped
types instead of hand-copying the field list. Re-typing fields means a new field
silently drifts out of sync.

```ts
// A create input: listed keys required, the rest optional (omittable or null).
type CreateInput<T, RequiredKeys extends keyof T> = Pick<T, RequiredKeys> &
  Partial<Omit<T, RequiredKeys>>;

export interface CreateApplicationInput {
  company: CreateInput<Company, "name">;
  role: CreateInput<Role, "title">;
}
```

...rather than restating `{ name: string; link?: string | null }` by hand.

### 3. Constants and shared values → name them once

A value that carries meaning in more than one place (an enum's members, an owner
id, a schema name, a magic string) is defined once and imported — never
re-inlined. `CONTEXT.md` domain values (e.g. the `Status` set) belong in one
exported declaration the rest of the code reads from.

**Why:** one place to change a concept; adding a field, a status, or a rule flows
everywhere it's used instead of leaving stale copies behind.

### When *not* to unify

Reuse serves clarity, not the reverse. Don't couple two things that merely look
alike today but change for different reasons (that trades Duplicated Code for
Divergent Change). If unifying forces flags, mode-switches, or a parameter that
only exists to pick between callers, keep them separate.
