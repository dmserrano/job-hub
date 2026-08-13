// Public entry point for the Tracker service module (ADR-0004).
//
// This is the ONLY path the UI (server actions, route handlers, server
// components) may import from. Nothing outside this module should reach into
// ./db or drizzle directly — that boundary is what lets the tracker be
// extracted into a standalone service later. Enforce it in code review.
export type {
  Application,
  ApplicationStatus,
  Company,
  CreateApplicationInput,
  Role,
  TrackerService,
} from "./service";
export { OWNER_ID, trackerService } from "./service";
export { APPLICATION_STATUSES } from "./db/schema";
