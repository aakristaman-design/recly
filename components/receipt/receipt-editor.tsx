"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ItemRow, type EditableItem } from "@/components/receipt/item-row";
import { ScanCtaButton } from "@/components/brand/scan-cta-button";
import { formatMoney, receiptTotalCents } from "@/lib/money";
import type { ScanResult } from "@/lib/receipt-schema";

// Screen 05 — the human-in-the-loop correction layer (Decision 2). Structure
// from Figma node 1:1192; copy from v2.0 §08 Screen 01; sticky footer with
// live total per Decision 4.
type ReceiptEditorProps = {
  scan: ScanResult;
  onSave: (items: EditableItem[]) => void;
  onScanAnother: () => void;
  saveHint?: string;
};

let nextId = 0;
function makeId() {
  nextId += 1;
  return `item-${nextId}`;
}

export function toEditableItems(scan: ScanResult): EditableItem[] {
  return scan.items.map((item) => ({
    id: makeId(),
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price.toFixed(2),
    category: item.category,
  }));
}

export function ReceiptEditor({
  scan,
  onSave,
  onScanAnother,
  saveHint,
}: ReceiptEditorProps) {
  const [items, setItems] = useState<EditableItem[]>(() => toEditableItems(scan));

  const patchItem = (id: string, patch: Partial<EditableItem>) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: makeId(),
        name: "",
        quantity: 1,
        unitPrice: "0.00",
        category: "Household",
      },
    ]);

  const headlineTotalCents =
    scan.total !== null ? Math.round(scan.total * 100) : receiptTotalCents(items);

  return (
    <div className="pb-40">
      <header className="px-4 pt-6">
        <h1 className="text-heading-lg">
          That&apos;s {scan.items.length} {scan.items.length === 1 ? "item" : "items"}.{" "}
          {formatMoney(headlineTotalCents)} total.
        </h1>
        <p className="mt-1 text-body text-ink-secondary">
          Here&apos;s what was on that receipt.
        </p>
        {scan.store && (
          <p className="mt-3 text-caption text-ink-secondary">
            {scan.store} · scanned just now
          </p>
        )}
      </header>

      <div className="mt-4 px-4">
        <div className="rounded-xl border border-border bg-surface-card">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onChange={(patch) => patchItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center gap-2 rounded-b-xl border-t border-border-light p-4 text-body text-ink-secondary transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            Add item
          </button>
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-label uppercase text-ink-secondary">Total</div>
            <div className="font-mono text-[24px] leading-tight" data-testid="live-total">
              {formatMoney(receiptTotalCents(items))}
            </div>
          </div>
          <ScanCtaButton onClick={() => onSave(items)}>
            Save this receipt
          </ScanCtaButton>
        </div>
        <div className="mx-auto flex max-w-md flex-col items-center gap-1 px-4 pb-3 text-center">
          {saveHint && <p className="text-caption text-danger">{saveHint}</p>}
          <button
            type="button"
            onClick={onScanAnother}
            className="text-body text-ink-secondary underline-offset-4 hover:underline"
          >
            Scan another receipt
          </button>
        </div>
      </footer>
    </div>
  );
}
