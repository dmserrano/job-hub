import { Badge } from "@/components/ui/badge";
import { STATUS_TONE } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/server/tracker";

/**
 * The one way a Status is rendered. It always spells the Status out, so the
 * colour is emphasis rather than the only carrier of meaning (WCAG 1.4.1).
 */
export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge className={cn(STATUS_TONE[status])}>{status}</Badge>;
}
