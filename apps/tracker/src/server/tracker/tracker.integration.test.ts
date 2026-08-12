import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  closeTestDb,
  migrateTestSchema,
  resetTestSchema,
} from "../../../test/db";
import { sql } from "./db/client";
import { TRACKER_SCHEMA } from "./db/env";
import { OWNER_ID, trackerService } from "./index";

// Integration tests against the Tracker service's public interface. They assert
// external behavior (returned values + persisted state) against real Postgres,
// never ORM/SQL internals — they should survive a rewrite of the query layer.
describe("tracker service", () => {
  beforeAll(async () => {
    await migrateTestSchema();
  });

  beforeEach(async () => {
    await resetTestSchema();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe("createApplication", () => {
    it("persists an application and returns it with a generated id", async () => {
      const app = await trackerService.createApplication({
        company: { name: "Acme", link: "https://acme.example" },
        role: {
          title: "Staff Engineer",
          postingLink: "https://acme.example/jobs/42",
          location: "Remote",
          comp: "$250k",
        },
      });

      expect(app.id).toBeGreaterThan(0);
      expect(app.ownerId).toBe(OWNER_ID);
      expect(app.company).toEqual({ name: "Acme", link: "https://acme.example" });
      expect(app.role).toEqual({
        title: "Staff Engineer",
        postingLink: "https://acme.example/jobs/42",
        location: "Remote",
        comp: "$250k",
      });
      expect(app.createdAt).toBeInstanceOf(Date);
      expect(app.updatedAt).toBeInstanceOf(Date);
    });

    it("defaults Status to Saved when none is given", async () => {
      const app = await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
      });

      expect(app.status).toBe("Saved");
    });

    it("honors an explicit Status", async () => {
      const app = await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
        status: "Applied",
      });

      expect(app.status).toBe("Applied");
    });

    it("stores omitted optional fields as null", async () => {
      const app = await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
      });

      expect(app.company.link).toBeNull();
      expect(app.role.postingLink).toBeNull();
      expect(app.role.location).toBeNull();
      expect(app.role.comp).toBeNull();
    });
  });

  describe("listApplications", () => {
    it("returns an empty list when none exist", async () => {
      expect(await trackerService.listApplications()).toEqual([]);
    });

    it("lists every persisted application, newest first", async () => {
      const first = await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
      });
      const second = await trackerService.createApplication({
        company: { name: "Globex" },
        role: { title: "Principal Engineer" },
        status: "Screen",
      });

      const apps = await trackerService.listApplications();

      expect(apps.map((a) => a.id)).toEqual([second.id, first.id]);
      expect(apps[0]).toMatchObject({
        id: second.id,
        company: { name: "Globex" },
        role: { title: "Principal Engineer" },
        status: "Screen",
      });
      expect(apps[1]).toMatchObject({
        id: first.id,
        company: { name: "Acme" },
        status: "Saved",
      });
    });

    it("returns only the Owner's applications, not other owners' rows", async () => {
      const mine = await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
      });
      // Seed a row for a different owner directly — the public interface only
      // ever writes as OWNER_ID, so scoping can't be exercised through it.
      await sql`
        INSERT INTO ${sql(TRACKER_SCHEMA)}.applications
          (owner_id, company_name, role_title)
        VALUES ('someone-else', 'Globex', 'Principal Engineer')
      `;

      const apps = await trackerService.listApplications();

      expect(apps.map((a) => a.id)).toEqual([mine.id]);
      expect(apps.every((a) => a.ownerId === OWNER_ID)).toBe(true);
    });

    it("persists applications across separate service calls (fresh reads)", async () => {
      await trackerService.createApplication({
        company: { name: "Acme" },
        role: { title: "Staff Engineer" },
      });

      // A second, independent list call sees the committed row — nothing is
      // held only in memory.
      expect(await trackerService.listApplications()).toHaveLength(1);
    });
  });
});
