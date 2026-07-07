import { cn } from "@/lib/utils";

// The scan line + dot device (v2.0 §03). System rule: the line always spans
// the full width of the active information it is clarifying; the dot marks
// the point of completion, flush right (1px gap maximum). Line and dot are
// always the same color — brand green by default, cream on green surfaces
// (e.g. spanning a primary CTA label).
const SIZES = {
  sm: { line: 1.5, dot: 4 },
  md: { line: 2, dot: 5 },
  lg: { line: 3, dot: 7 },
} as const;

type ScanMarkProps = {
  size?: keyof typeof SIZES;
  tone?: "green" | "cream";
  className?: string;
  style?: React.CSSProperties;
};

export function ScanMark({
  size = "sm",
  tone = "green",
  className,
  style,
}: ScanMarkProps) {
  const s = SIZES[size];
  const color = tone === "green" ? "bg-green" : "bg-cream";
  return (
    <div
      aria-hidden
      className={cn("flex w-full items-center gap-px", className)}
      style={style}
    >
      <div className={cn("flex-1 rounded-full", color)} style={{ height: s.line }} />
      <div
        className={cn("shrink-0 rounded-full", color)}
        style={{ width: s.dot, height: s.dot }}
      />
    </div>
  );
}
