"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanCtaButton } from "@/components/brand/scan-cta-button";
import { ScanProgress } from "@/components/brand/scan-progress";
import { ReceiptEditor } from "@/components/receipt/receipt-editor";
import type { EditableItem } from "@/components/receipt/item-row";
import { formatMoney, parsePriceCents, receiptTotalCents } from "@/lib/money";
import type { ScanResult } from "@/lib/receipt-schema";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

// Deadpan error strings (§07): data first, no exclamation, no apology.
const ERROR_COPY: Record<string, string> = {
  UNREADABLE: "The photo may be blurry, dark, or not a receipt.",
  FILE_TOO_LARGE: "That photo is over 8 MB. Choose a smaller one.",
  PARSE_FAILED: "The scan came back garbled. Try another photo.",
  DEFAULT: "The scanner had a problem. Try again.",
};

// Dev/demo fixture (?fixture=1): verbatim output of /api/scan-receipt on the
// tested Safeway receipt — lets the editor render without a file dialog.
// The primary flow always calls the real endpoint.
const FIXTURE_SCAN: ScanResult = {
  transcript: "",
  readable: true,
  store: "Safeway",
  date: "2026-07-05",
  total: 20.12,
  items: [
    { name: "Simply Orange", quantity: 1, unit_price: 7.99, category: "Produce" },
    { name: "SC Soup Broccoli", quantity: 2, unit_price: 6.0, category: "Produce" },
    { name: "Recycle Bag Charge", quantity: 1, unit_price: 0.12, category: "Household" },
  ],
};

type ScanState =
  | { phase: "idle" }
  | { phase: "scanning" }
  | { phase: "error"; code: string }
  | { phase: "parsed"; scan: ScanResult }
  | { phase: "saved"; itemCount: number; totalCents: number };

function ScanFlow() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ScanState>(() =>
    searchParams.get("fixture") === "1"
      ? { phase: "parsed", scan: FIXTURE_SCAN }
      : { phase: "idle" },
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = () => fileInputRef.current?.click();

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setState({ phase: "error", code: "FILE_TOO_LARGE" });
      return;
    }
    setState({ phase: "scanning" });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/scan-receipt", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.receipt) {
        setState({ phase: "error", code: json?.error ?? "DEFAULT" });
        return;
      }
      setState({ phase: "parsed", scan: json.receipt as ScanResult });
    } catch {
      setState({ phase: "error", code: "DEFAULT" });
    }
  };

  const reset = () => {
    setSaveError(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setState({ phase: "idle" });
  };

  const handleSave = async (scan: ScanResult, items: EditableItem[]) => {
    setSaveError(undefined);
    const invalid = items.some(
      (item) => item.name.trim() === "" || parsePriceCents(item.unitPrice) === null,
    );
    if (items.length === 0 || invalid) {
      setSaveError("Every item needs a name and a price.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: scan.store,
          date: scan.date,
          total_cents: scan.total === null ? null : Math.round(scan.total * 100),
          items: items.map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity,
            unit_price_cents: parsePriceCents(item.unitPrice) ?? 0,
            category: item.category,
          })),
        }),
      });
      if (!res.ok) {
        setSaveError("Couldn't save that receipt. Try again.");
        return;
      }
      setState({
        phase: "saved",
        itemCount: items.length,
        totalCents: receiptTotalCents(items),
      });
    } catch {
      setSaveError("Couldn't save that receipt. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-md">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="flex items-center px-4 pt-4">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-faint hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {state.phase === "idle" && (
        <div className="flex flex-col items-start gap-2 px-4 pt-10">
          <h1 className="text-heading-lg">Scan a receipt</h1>
          <p className="text-body text-ink-secondary">
            Upload a photo of a grocery receipt.
          </p>
          <ScanCtaButton onClick={pickFile} className="mt-4">
            Choose photo
          </ScanCtaButton>
          <p className="mt-2 text-caption text-ink-tertiary">
            JPEG, PNG, or WebP · 8 MB max
          </p>
        </div>
      )}

      {state.phase === "scanning" && (
        <div className="flex flex-col gap-4 px-4 pt-10">
          <p className="text-body">Reading the receipt.</p>
          <ScanProgress />
          <p className="text-caption text-ink-secondary">
            Every line item, one by one.
          </p>
        </div>
      )}

      {state.phase === "error" && (
        <div className="flex flex-col items-start gap-2 px-4 pt-10">
          <div className="w-full rounded-xl border border-danger/30 bg-danger-bg p-4">
            <p className="text-body font-medium">Couldn&apos;t read that.</p>
            <p className="mt-1 text-body text-ink-secondary">
              {ERROR_COPY[state.code] ?? ERROR_COPY.DEFAULT}
            </p>
          </div>
          <Button variant="outline" onClick={pickFile} className="mt-2">
            Try another photo
          </Button>
        </div>
      )}

      {state.phase === "parsed" && (
        <ReceiptEditor
          scan={state.scan}
          saving={saving}
          saveError={saveError}
          onSave={(items) => void handleSave(state.scan, items)}
          onScanAnother={reset}
        />
      )}

      {state.phase === "saved" && (
        <div className="flex flex-col items-start gap-2 px-4 pt-10">
          <h1 className="text-heading-lg">Saved.</h1>
          <p className="font-mono text-data">
            {state.itemCount} {state.itemCount === 1 ? "item" : "items"} ·{" "}
            {formatMoney(state.totalCents)}
          </p>
          <ScanCtaButton onClick={reset} className="mt-4">
            Scan another receipt
          </ScanCtaButton>
        </div>
      )}
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanFlow />
    </Suspense>
  );
}
