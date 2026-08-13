import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "job-hub — Application Tracker",
  description: "Track job applications through the pipeline.",
};

// The system font stack is the theme's `--font-sans` (globals.css) and is
// applied to <html> by the base layer — no webfont to fetch at build time.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
