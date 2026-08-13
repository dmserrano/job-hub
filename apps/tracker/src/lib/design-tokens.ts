import type { ApplicationStatus } from "@/server/tracker";

/**
 * The domain half of the design system: the bit Tailwind and shadcn have no
 * opinion about — what a `Status` looks like, and how urgency is emphasised.
 *
 * A tone is the utility pair that paints one meaning; the colours themselves
 * live as `@theme` tokens in `app/globals.css`, one declaration per token
 * covering both light and dark.
 *
 * `STATUS_TONE` is keyed by `ApplicationStatus`, so it is the exported Status
 * set (CONTEXT.md, `APPLICATION_STATUSES`) that drives this map rather than a
 * second hand-written list — adding a Status is a type error here.
 */
export const STATUS_TONE: Record<ApplicationStatus, string> = {
  Saved: "bg-status-saved text-status-saved-foreground",
  Applied: "bg-status-applied text-status-applied-foreground",
  Screen: "bg-status-screen text-status-screen-foreground",
  Interview: "bg-status-interview text-status-interview-foreground",
  Offer: "bg-status-offer text-status-offer-foreground",
  Closed: "bg-status-closed text-status-closed-foreground",
};

/**
 * How much attention an Application is owed right now. Not a stored field —
 * derived from Next action's due date and the Activity log (MVP scope: stale
 * is "no activity in ~7 days"). Named here so #6 and #8 render it the same way.
 */
export const URGENCIES = ["overdue", "due soon", "stale"] as const;

export type Urgency = (typeof URGENCIES)[number];

export const URGENCY_TONE: Record<Urgency, string> = {
  overdue: "bg-urgency-overdue text-urgency-overdue-foreground",
  "due soon": "bg-urgency-due-soon text-urgency-due-soon-foreground",
  stale: "bg-urgency-stale text-urgency-stale-foreground",
};
