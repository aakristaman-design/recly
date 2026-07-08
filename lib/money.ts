// Money math in integer cents — float dollars only at the display edge.
import type { EditableItem } from "@/components/receipt/item-row";

export function parsePriceCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/^\$/, "");
  if (trimmed === "" || !/^\d*\.?\d*$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function lineTotalCents(item: {
  quantity: number;
  unitPrice: string;
}): number | null {
  const cents = parsePriceCents(item.unitPrice);
  if (cents === null) return null;
  return item.quantity * cents;
}

export function receiptTotalCents(items: EditableItem[]): number {
  return items.reduce((sum, item) => sum + (lineTotalCents(item) ?? 0), 0);
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// "Items" always means units purchased (a 2× line is 2 items) — the same
// definition everywhere: editor headline, saved state, dashboard, receipts.
export function unitCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
