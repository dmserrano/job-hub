"use server";

import { revalidatePath } from "next/cache";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type CreateApplicationInput,
  trackerService,
} from "@/server/tracker";

// Read an optional text field: trimmed, with empty strings collapsed to null so
// blank inputs persist as "unset" rather than "".
function optionalText(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function requiredText(form: FormData, key: string, label: string): string {
  const value = optionalText(form, key);
  if (value === null) {
    throw new Error(`${label} is required`);
  }
  return value;
}

function parseStatus(form: FormData): ApplicationStatus | undefined {
  const value = form.get("status");
  if (typeof value !== "string" || value === "") return undefined;
  if (!(APPLICATION_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`Unknown status: ${value}`);
  }
  return value as ApplicationStatus;
}

// Server action backing the manual create form. The UI reaches the database only
// through the Tracker service module (ADR-0004) — never the ORM directly.
export async function createApplicationAction(form: FormData): Promise<void> {
  const input: CreateApplicationInput = {
    company: {
      name: requiredText(form, "companyName", "Company name"),
      link: optionalText(form, "companyLink"),
    },
    role: {
      title: requiredText(form, "roleTitle", "Role title"),
      postingLink: optionalText(form, "rolePostingLink"),
      location: optionalText(form, "roleLocation"),
      comp: optionalText(form, "roleComp"),
    },
    status: parseStatus(form),
  };

  await trackerService.createApplication(input);
  revalidatePath("/");
}
