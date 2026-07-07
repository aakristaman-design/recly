import { cn } from "@/lib/utils";

// The scan-line device as OCR progress (v2.0 §03): the line grows
// left→right as the receipt is read; the dot waits at the completion point.
export function ScanProgress({ className }: { className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label="Reading the receipt"
      className={cn("flex w-full items-center gap-px", className)}
    >
      <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-border-light">
        <div className="animate-scan absolute inset-y-0 left-0 rounded-full bg-green" />
      </div>
      <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-green" />
    </div>
  );
}
