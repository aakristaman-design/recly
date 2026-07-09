"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanLine } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScanFlow } from "@/components/scan/scan-flow";

// Persistent scan FAB (Decision 6): scanning is the primary action — the
// raised button keeps that hierarchy visible on every main screen. Opens
// the scan flow as a bottom sheet over the current screen.
//
// Close rule (one rule, no confirm step): the sheet closes only via the ×
// or Escape — backdrop taps are ignored — and closing always discards any
// unsaved parse (the flow unmounts with the sheet). Radix supplies the
// focus trap and returns focus to this button on close.
//
// Preview params (same convention as ?empty=1): ?scan=1 opens the sheet on
// load; with &fixture=1 it starts from the fixture parse.
export function ScanFab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("scan") === "1");
  const fixture = searchParams.get("fixture") === "1";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Scan a receipt"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-green text-cream shadow-lg transition-transform hover:scale-105"
        >
          <ScanLine className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[92dvh] overflow-y-auto rounded-t-2xl border-border bg-surface-page p-0"
      >
        <SheetTitle className="sr-only">Scan a receipt</SheetTitle>
        <div className="mx-auto max-w-md">
          <ScanFlow
            initialFixture={fixture}
            onSaved={() => router.refresh()}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
