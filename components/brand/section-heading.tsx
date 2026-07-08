import { ScanMark } from "@/components/brand/scan-mark";

// Section headings carry the device (v2.0 §03): the line + dot runs under
// the headline, spanning exactly the width of the text it clarifies.
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex flex-col gap-1.5">
      <h2 className="text-heading-md">{children}</h2>
      <ScanMark size="sm" />
    </div>
  );
}
