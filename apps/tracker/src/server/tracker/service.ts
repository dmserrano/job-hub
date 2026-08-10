import { db } from "./db/client";
import { connectionProbe, type ConnectionProbe } from "./db/schema";

// The Tracker service interface: the single behavioral seam the UI depends on
// (ADR-0004). It is deliberately minimal for issue #2 — a real DB round-trip to
// prove the wiring. Domain methods (createApplication, listApplications, the
// dashboard queries) are added in later issues behind this same boundary.
export interface TrackerService {
  /** Write a row and read it back, proving the DB connection + schema wiring. */
  checkConnection(note: string): Promise<ConnectionProbe>;
  /** Count the probe rows currently persisted. */
  countProbes(): Promise<number>;
}

export const trackerService: TrackerService = {
  async checkConnection(note) {
    const [row] = await db
      .insert(connectionProbe)
      .values({ note })
      .returning();
    if (!row) {
      throw new Error("connection_probe insert returned no row");
    }
    return row;
  },

  async countProbes() {
    const rows = await db.select().from(connectionProbe);
    return rows.length;
  },
};
