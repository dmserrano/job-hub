import { trackerService } from "@/server/tracker";

// Force a real request-time DB round-trip so booting the app proves the wiring
// (issue #2). This page is a placeholder; the Dashboard lands in a later issue.
export const dynamic = "force-dynamic";

export default async function Home() {
  const probe = await trackerService.checkConnection("boot round-trip");
  const total = await trackerService.countProbes();

  return (
    <main>
      <h1>job-hub — Application Tracker</h1>
      <p>
        Scaffold is live. The page just completed a real database round-trip
        through the Tracker service.
      </p>
      <dl>
        <dt>Latest probe id</dt>
        <dd>
          <code>{probe.id}</code>
        </dd>
        <dt>Written at</dt>
        <dd>
          <code>{probe.createdAt.toISOString()}</code>
        </dd>
        <dt>Probe rows persisted</dt>
        <dd>
          <code>{total}</code>
        </dd>
      </dl>
    </main>
  );
}
