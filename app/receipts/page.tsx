import Link from "next/link";
import { ArrowLeft, ChevronDown, ReceiptText } from "lucide-react";
import { CategoryDot, CATEGORY_HEX } from "@/components/brand/category-dot";
import { DeleteReceiptButton } from "@/components/receipt/delete-receipt-button";
import { ScanFab } from "@/components/brand/scan-fab";
import {
  fetchReceiptHistory,
  type ReceiptItemLine,
} from "@/lib/dashboard-data";
import { formatMoney } from "@/lib/money";
import type { Category } from "@/lib/receipt-schema";

// Screen 09 — receipt history. Structure from Figma node 1:1592, minus the
// search box and time-filter pills: at the current data volume they would
// be decorative controls with one possible answer, and fake chrome is worse
// than no chrome. Rows expand in place (<details>) so a saved receipt can
// be reopened without an off-inventory detail screen.
export const dynamic = "force-dynamic";

const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function dominantCategory(items: ReceiptItemLine[]): Category | null {
  const totals = new Map<Category, number>();
  for (const item of items) {
    totals.set(
      item.category,
      (totals.get(item.category) ?? 0) + item.quantity * item.unit_price_cents,
    );
  }
  let best: Category | null = null;
  let bestCents = -1;
  totals.forEach((cents, category) => {
    if (cents > bestCents) {
      best = category;
      bestCents = cents;
    }
  });
  return best;
}

export default async function ReceiptHistory({
  searchParams,
}: {
  searchParams: { open?: string };
}) {
  const { receipts, itemsByReceipt } = await fetchReceiptHistory();
  const totalCents = receipts.reduce((s, r) => s + r.items_total_cents, 0);

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-faint hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-heading-lg">Receipts</h1>
      </div>

      {receipts.length === 0 ? (
        <p className="mt-6 text-body text-ink-secondary">
          Nothing scanned yet.
        </p>
      ) : (
        <>
          <p className="mt-4 font-mono text-data text-ink-secondary">
            {receipts.length} {receipts.length === 1 ? "receipt" : "receipts"} ·{" "}
            {formatMoney(totalCents)} total
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {receipts.map((receipt) => {
              const items = itemsByReceipt.get(receipt.id) ?? [];
              const accent = dominantCategory(items);
              return (
                <details
                  key={receipt.id}
                  id={receipt.id}
                  open={receipt.id === searchParams.open || undefined}
                  className="group scroll-mt-4 overflow-hidden rounded-xl border border-border bg-surface-card"
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: accent ? CATEGORY_HEX[accent] : "#D8D4CC",
                  }}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-faint">
                      <ReceiptText className="h-4 w-4 text-ink-secondary" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-body font-medium">
                        {receipt.store ?? "Unknown store"}
                      </span>
                      <span className="text-caption text-ink-secondary">
                        {receipt.item_count}{" "}
                        {receipt.item_count === 1 ? "item" : "items"} ·{" "}
                        {DAY_LABEL.format(new Date(receipt.purchased_on))}
                      </span>
                    </span>
                    <span className="ml-auto font-mono text-data">
                      {formatMoney(receipt.items_total_cents)}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-tertiary transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border-light">
                    {items.map((item, i) => (
                      <div
                        key={`${receipt.id}-${i}`}
                        className="flex items-center gap-3 border-b border-border-light px-4 py-3 last:border-b-0"
                      >
                        <CategoryDot category={item.category} />
                        <span className="min-w-0 truncate text-body">
                          {item.name}
                        </span>
                        {item.quantity > 1 && (
                          <span className="shrink-0 font-mono text-data-sm text-ink-secondary">
                            ×{item.quantity}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 font-mono text-data">
                          {formatMoney(item.quantity * item.unit_price_cents)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border-light">
                      <DeleteReceiptButton
                        receiptId={receipt.id}
                        itemCount={receipt.item_count}
                      />
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}

      <ScanFab />
    </main>
  );
}
