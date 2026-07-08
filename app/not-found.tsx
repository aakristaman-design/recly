import { ScanCtaButton } from "@/components/brand/scan-cta-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-3 px-4">
      <h1 className="text-heading-lg">That page doesn&apos;t exist.</h1>
      <p className="text-body text-ink-secondary">
        Nothing was scanned here.
      </p>
      <ScanCtaButton href="/" className="mt-2">
        Back to the dashboard
      </ScanCtaButton>
    </main>
  );
}
