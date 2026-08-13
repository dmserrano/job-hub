import type { ReactNode } from "react";
import { createApplicationAction } from "./actions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPLICATION_STATUSES, trackerService } from "@/server/tracker";

// The table reflects the current database on every request.
export const dynamic = "force-dynamic";

function formatLink(url: string | null, label: string | null) {
  if (!url) return label ?? "—";
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="underline underline-offset-4 hover:no-underline"
    >
      {label ?? url}
    </a>
  );
}

// A labelled control in the add-application form. The label points at `name`,
// so whatever control goes inside must carry `id={name}`.
function Field({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
    </div>
  );
}

function TextField({
  name,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { name: string; label: string }) {
  return (
    <Field name={name} label={label}>
      <Input id={name} name={name} {...props} />
    </Field>
  );
}

export default async function Home() {
  const applications = await trackerService.listApplications();

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        job-hub — Application Tracker
      </h1>

      <section aria-labelledby="add-heading" className="space-y-4">
        <h2 id="add-heading" className="text-lg font-semibold">
          Add an application
        </h2>
        <form
          action={createApplicationAction}
          className="flex max-w-md flex-col gap-3"
        >
          <TextField name="companyName" label="Company name *" required />
          <TextField name="companyLink" label="Company link" type="url" />
          <TextField name="roleTitle" label="Role title *" required />
          <TextField name="rolePostingLink" label="Posting link" type="url" />
          <TextField name="roleLocation" label="Location" />
          <TextField name="roleComp" label="Comp" />

          <Field name="status" label="Status">
            {/* Omitting status falls back to the same Saved the trigger shows
                (the column's default), so a pre-hydration submit still agrees
                with the form. */}
            <Select name="status" defaultValue="Saved">
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Button type="submit" className="self-start">
            Add application
          </Button>
        </form>
      </section>

      <section aria-labelledby="list-heading" className="space-y-4">
        <h2 id="list-heading" className="text-lg font-semibold">
          Applications ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No applications yet. Add your first one above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Comp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    {formatLink(app.company.link, app.company.name)}
                  </TableCell>
                  <TableCell>
                    {formatLink(app.role.postingLink, app.role.title)}
                  </TableCell>
                  <TableCell>{app.role.location ?? "—"}</TableCell>
                  <TableCell>{app.role.comp ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  );
}
