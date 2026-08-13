import { desc, eq } from "drizzle-orm";
import { db } from "./db/client";
import {
  APPLICATION_STATUSES,
  applications,
  type ApplicationRow,
} from "./db/schema";

// The single hardcoded Owner every record is scoped to for now (ADR-0001).
// When real multi-user arrives this becomes the authenticated user id; the
// column and scoping already exist, so it's a wiring change, not a migration.
export const OWNER_ID = "owner-solo";

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Domain shapes the service exposes. Company and Role are nested here even though
// they're stored as flat columns — the UI depends on this shape, not on the
// table layout (ADR-0004), so storage can change without touching callers.
export interface Company {
  name: string;
  link: string | null;
}

export interface Role {
  title: string;
  postingLink: string | null;
  location: string | null;
  comp: string | null;
}

export interface Application {
  id: number;
  ownerId: string;
  company: Company;
  role: Role;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// A create-input shape derived from a domain type: the listed keys stay
// required; every other field becomes optional (omittable or null). Derived
// from the domain types so a new Company/Role field can't drift out of sync
// with its input (see CODING_STANDARDS.md — single source of truth).
type CreateInput<T, RequiredKeys extends keyof T> = Pick<T, RequiredKeys> &
  Partial<Omit<T, RequiredKeys>>;

export interface CreateApplicationInput {
  company: CreateInput<Company, "name">;
  role: CreateInput<Role, "title">;
  /** Defaults to `Saved` when omitted. */
  status?: ApplicationStatus;
}

// The Tracker service interface: the single behavioral boundary the UI depends
// on (ADR-0004). Nothing outside this module touches the ORM directly.
export interface TrackerService {
  /** Persist a new Application for the Owner and return it. */
  createApplication(input: CreateApplicationInput): Promise<Application>;
  /** Every Application owned by the Owner, newest first. */
  listApplications(): Promise<Application[]>;
}

function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    ownerId: row.ownerId,
    company: { name: row.companyName, link: row.companyLink },
    role: {
      title: row.roleTitle,
      postingLink: row.rolePostingLink,
      location: row.roleLocation,
      comp: row.roleComp,
    },
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const trackerService: TrackerService = {
  async createApplication(input) {
    const [row] = await db
      .insert(applications)
      .values({
        ownerId: OWNER_ID,
        companyName: input.company.name,
        companyLink: input.company.link ?? null,
        roleTitle: input.role.title,
        rolePostingLink: input.role.postingLink ?? null,
        roleLocation: input.role.location ?? null,
        roleComp: input.role.comp ?? null,
        status: input.status,
      })
      .returning();
    if (!row) {
      throw new Error("applications insert returned no row");
    }
    return toApplication(row);
  },

  async listApplications() {
    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.ownerId, OWNER_ID))
      .orderBy(desc(applications.createdAt), desc(applications.id));
    return rows.map(toApplication);
  },
};
