import Link from "next/link";
import { ScanLine } from "lucide-react";

// Persistent scan FAB (Decision 6): scanning is the primary action — the
// raised button keeps that hierarchy visible on every main screen.
export function ScanFab() {
  return (
    <Link
      href="/scan"
      aria-label="Scan a receipt"
      className="fixed bottom-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-green text-cream shadow-lg transition-transform hover:scale-105"
    >
      <ScanLine className="h-6 w-6" />
    </Link>
  );
}
