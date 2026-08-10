import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  closeTestDb,
  migrateTestSchema,
  resetTestSchema,
} from "../../../test/db";
import { trackerService } from "./index";

// Integration tests at the Tracker service seam. They assert external behavior
// (returned values + persisted state) against real Postgres, never ORM/SQL
// internals — they should survive a rewrite of the query layer.
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

  it("persists a probe and reads it back on checkConnection", async () => {
    const probe = await trackerService.checkConnection("hello");

    expect(probe.id).toBeGreaterThan(0);
    expect(probe.note).toBe("hello");
    expect(probe.createdAt).toBeInstanceOf(Date);
  });

  it("counts the probes that have been persisted", async () => {
    expect(await trackerService.countProbes()).toBe(0);

    await trackerService.checkConnection("one");
    await trackerService.checkConnection("two");

    expect(await trackerService.countProbes()).toBe(2);
  });

  it("isolates state between tests via the reset harness", async () => {
    // If the beforeEach reset works, this test starts empty despite the
    // previous test having written rows.
    expect(await trackerService.countProbes()).toBe(0);
  });
});
