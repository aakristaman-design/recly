import type { Metadata } from "next";
import { BarChart3, PencilLine, ScanLine } from "lucide-react";
import { ScanMark } from "@/components/brand/scan-mark";
import { GetStarted } from "@/components/onboarding/get-started";

// Screen 10 — onboarding. Structure from Figma node 1:1858; copy rewritten
// per §07 (deadpan, no marketing voice) and §06 (supporting tagline).
// The Figma "Sign in" ghost CTA is omitted: auth is cut from the slice,
// and a dead-end tap is worse than no tap.
export const metadata: Metadata = {
  title: "Recly — Every item. Every trip. Clearly.",
};

const FEATURES = [
  {
    icon: ScanLine,
    title: "Scan the receipt",
    body: "Every item and price is read from the paper. Not just the store total.",
  },
  {
    icon: PencilLine,
    title: "Fix what it got wrong",
    body: "OCR misreads things. You correct them before anything is saved.",
  },
  {
    icon: BarChart3,
    title: "See where it went",
    body: "Categories, months, items — charts built from your corrected data.",
  },
];

export default function Welcome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16">
      <div className="inline-flex flex-col self-start">
        <h1 className="text-display lowercase">recly</h1>
        <ScanMark size="lg" style={{ marginTop: -8 }} />
      </div>
      <p className="mt-4 text-body text-ink-secondary">
        Every item. Every trip. Clearly.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <section
            key={title}
            className="flex items-start gap-4 rounded-xl border border-border bg-surface-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-faint text-ink">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <h2 className="text-heading-md">{title}</h2>
              <p className="mt-1 text-body text-ink-secondary">{body}</p>
            </span>
          </section>
        ))}
      </div>

      <div className="mt-auto pt-10">
        <GetStarted />
      </div>
    </main>
  );
}
