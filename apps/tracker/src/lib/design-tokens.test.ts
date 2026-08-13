import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { APPLICATION_STATUSES } from "@/server/tracker";
import { STATUS_TONE, URGENCIES, URGENCY_TONE } from "@/lib/design-tokens";
import { StatusBadge } from "@/components/status-badge";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

// --- Minimal oklch → sRGB → WCAG contrast, so the AA claim is checked rather
// than asserted in a comment. Test-only; nothing ships with this.

// Clamping an out-of-gamut channel would make the computed ratio disagree with
// what a browser paints, so refuse rather than fudge — every token must be a
// colour sRGB can actually show.
function inGamut(channel: number): number {
  if (channel < -1e-6 || channel > 1 + 1e-6) {
    throw new Error(`Channel ${channel} is outside the sRGB gamut`);
  }
  return Math.min(1, Math.max(0, channel));
}

function oklchToLinearSrgb(
  l: number,
  c: number,
  hDeg: number,
): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    inGamut(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short),
    inGamut(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short),
    inGamut(-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short),
  ];
}

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

function relativeLuminance(colour: string): number {
  const [l, c, h] = (OKLCH.exec(colour)?.slice(1) ?? []).map(Number);
  if (l === undefined || c === undefined || h === undefined) {
    throw new Error(`Not a plain oklch() colour: ${colour}`);
  }
  const [r, g, b] = oklchToLinearSrgb(l, c, h);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const hi = Math.max(first, second);
  const lo = Math.min(first, second);
  return (hi + 0.05) / (lo + 0.05);
}

// --- Token lookup against the real stylesheet.

// Every domain token is declared once as `light-dark(<light>, <dark>)`, so one
// declaration carries both themes.
function themePair(token: string): { light: string; dark: string } {
  const declaration = new RegExp(
    `--color-${token}:\\s*light-dark\\(([^,]+),([^)]+\\))\\s*\\)`,
  ).exec(css);
  const [, light, dark] = declaration ?? [];
  if (light === undefined || dark === undefined) {
    throw new Error(`No light-dark() token --color-${token} in globals.css`);
  }
  return { light: light.trim(), dark: dark.trim() };
}

// "bg-status-saved text-status-saved-foreground" → the two token names it needs.
function toneTokens(tone: string): { background: string; foreground: string } {
  const background = /\bbg-([\w-]+)/.exec(tone)?.[1];
  const foreground = /\btext-([\w-]+)/.exec(tone)?.[1];
  if (!background || !foreground) {
    throw new Error(`Tone is missing a bg-/text- utility pair: ${tone}`);
  }
  return { background, foreground };
}

function expectsAaInBothThemes(tone: string) {
  const { background, foreground } = toneTokens(tone);
  const bg = themePair(background);
  const fg = themePair(foreground);
  expect(contrastRatio(bg.light, fg.light)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(bg.dark, fg.dark)).toBeGreaterThanOrEqual(4.5);
}

describe("Status tones", () => {
  it("covers exactly the exported Status set — no second list", () => {
    expect(Object.keys(STATUS_TONE).sort()).toEqual(
      [...APPLICATION_STATUSES].sort(),
    );
  });

  it.each(APPLICATION_STATUSES)(
    "%s is legible at WCAG AA in light and dark",
    (status) => expectsAaInBothThemes(STATUS_TONE[status]),
  );

  it.each(APPLICATION_STATUSES)(
    "%s is never carried by colour alone",
    (status) => {
      // The badge always spells the Status out alongside the tone.
      expect(StatusBadge({ status }).props.children).toBe(status);
    },
  );
});

describe("Urgency tones", () => {
  it("covers overdue, due soon and stale", () => {
    expect(Object.keys(URGENCY_TONE).sort()).toEqual([...URGENCIES].sort());
  });

  it.each(URGENCIES)(
    "%s is legible at WCAG AA in light and dark",
    (urgency) => expectsAaInBothThemes(URGENCY_TONE[urgency]),
  );
});
