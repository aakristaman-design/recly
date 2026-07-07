import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ScanMark } from "@/components/brand/scan-mark";
import { cn } from "@/lib/utils";

// Primary CTA (v2.0 §03): the scan line spans the full width of the button
// label, dot flush right — completion signal on the action itself.
type ScanCtaButtonProps = Omit<ButtonProps, "asChild"> & { href?: string };

export function ScanCtaButton({
  children,
  className,
  href,
  ...props
}: ScanCtaButtonProps) {
  const content = (
    <span className="flex flex-col items-stretch gap-1">
      <span>{children}</span>
      <ScanMark tone="cream" size="sm" />
    </span>
  );
  if (href) {
    return (
      <Button className={cn("h-12 px-6", className)} asChild {...props}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }
  return (
    <Button className={cn("h-12 px-6", className)} {...props}>
      {content}
    </Button>
  );
}
