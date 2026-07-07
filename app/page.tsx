import { ScanMark } from "@/components/brand/scan-mark";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col gap-4">
        <div className="inline-flex flex-col">
          <h1 className="text-display lowercase">recly</h1>
          {/* line sits 4–5px below the wordmark baseline; the y tail crosses it */}
          <ScanMark size="lg" style={{ marginTop: -8 }} />
        </div>
        <p className="text-body text-ink-secondary">See it clearly.</p>
        <p className="font-mono text-data">0 receipts · $0.00</p>
      </div>
    </main>
  );
}
