import { createApplicationAction } from "./actions";
import { APPLICATION_STATUSES, trackerService } from "@/server/tracker";

// The table reflects the current database on every request.
export const dynamic = "force-dynamic";

function formatLink(url: string | null, label: string | null) {
  if (!url) return label ?? "—";
  return (
    <a href={url} target="_blank" rel="noreferrer noopener">
      {label ?? url}
    </a>
  );
}

export default async function Home() {
  const applications = await trackerService.listApplications();

  return (
    <main>
      <h1>job-hub — Application Tracker</h1>

      <section aria-labelledby="add-heading">
        <h2 id="add-heading">Add an application</h2>
        <form action={createApplicationAction} className="stack">
          <div className="field">
            <label htmlFor="companyName">Company name *</label>
            <input id="companyName" name="companyName" required />
          </div>
          <div className="field">
            <label htmlFor="companyLink">Company link</label>
            <input id="companyLink" name="companyLink" type="url" />
          </div>
          <div className="field">
            <label htmlFor="roleTitle">Role title *</label>
            <input id="roleTitle" name="roleTitle" required />
          </div>
          <div className="field">
            <label htmlFor="rolePostingLink">Posting link</label>
            <input id="rolePostingLink" name="rolePostingLink" type="url" />
          </div>
          <div className="field">
            <label htmlFor="roleLocation">Location</label>
            <input id="roleLocation" name="roleLocation" />
          </div>
          <div className="field">
            <label htmlFor="roleComp">Comp</label>
            <input id="roleComp" name="roleComp" />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="Saved">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add application</button>
        </form>
      </section>

      <section aria-labelledby="list-heading">
        <h2 id="list-heading">Applications ({applications.length})</h2>
        {applications.length === 0 ? (
          <p>No applications yet. Add your first one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Comp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{formatLink(app.company.link, app.company.name)}</td>
                  <td>{formatLink(app.role.postingLink, app.role.title)}</td>
                  <td>{app.role.location ?? "—"}</td>
                  <td>{app.role.comp ?? "—"}</td>
                  <td>{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
