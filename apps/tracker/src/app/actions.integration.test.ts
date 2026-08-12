import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeTestDb,
  migrateTestSchema,
  resetTestSchema,
} from "../../test/db";
import { trackerService } from "@/server/tracker";

// The server action calls revalidatePath, which needs a Next request context we
// don't have here. Stub it — we're testing the FormData → service → persistence
// path, not Next's cache plumbing.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createApplicationAction } = await import("./actions");

function formData(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    form.set(key, value);
  }
  return form;
}

// Integration tests for the create form: a submitted FormData ends up as a
// persisted Application readable through the service, exercising the real UI →
// service → Postgres path.
describe("createApplicationAction", () => {
  beforeAll(async () => {
    await migrateTestSchema();
  });

  beforeEach(async () => {
    await resetTestSchema();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("persists a submitted application, readable via the service", async () => {
    await createApplicationAction(
      formData({
        companyName: "Acme",
        companyLink: "https://acme.example",
        roleTitle: "Staff Engineer",
        rolePostingLink: "https://acme.example/jobs/1",
        roleLocation: "Remote",
        roleComp: "$250k",
        status: "Applied",
      }),
    );

    const apps = await trackerService.listApplications();
    expect(apps).toHaveLength(1);
    const app = apps[0]!;
    expect(app).toMatchObject({
      company: { name: "Acme", link: "https://acme.example" },
      role: {
        title: "Staff Engineer",
        postingLink: "https://acme.example/jobs/1",
        location: "Remote",
        comp: "$250k",
      },
      status: "Applied",
    });
  });

  it("collapses blank optional fields to null and defaults Status to Saved", async () => {
    await createApplicationAction(
      formData({
        companyName: "  Globex  ",
        companyLink: "   ",
        roleTitle: "Principal Engineer",
        rolePostingLink: "",
        roleLocation: "",
        roleComp: "",
        status: "",
      }),
    );

    const apps = await trackerService.listApplications();
    expect(apps).toHaveLength(1);
    const app = apps[0]!;
    expect(app.company).toEqual({ name: "Globex", link: null });
    expect(app.role).toEqual({
      title: "Principal Engineer",
      postingLink: null,
      location: null,
      comp: null,
    });
    expect(app.status).toBe("Saved");
  });

  it("rejects a submission missing the required company name", async () => {
    await expect(
      createApplicationAction(formData({ roleTitle: "Staff Engineer" })),
    ).rejects.toThrow(/company name is required/i);

    expect(await trackerService.listApplications()).toHaveLength(0);
  });
});
