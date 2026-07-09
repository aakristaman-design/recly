import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronRight, ReceiptText } from "lucide-react";
import { ScanMark } from "@/components/brand/scan-mark";
import { ScanFab } from "@/components/brand/scan-fab";
import { SectionHeading } from "@/components/brand/section-heading";
import { CategoryDot } from "@/components/brand/category-dot";
import { TrendChart } from "@/components/dashboard/trend-chart";
import {
  fetchDashboardData,
  monthKey,
  previousMonthKey,
  type MonthlyCategoryTotal,
} from "@/lib/dashboard-data";
import { formatMoney } from "@/lib/money";

// Screen 06 — structure from Figma node 1:8, minus the off-spec parts
// (greeting, donut, period toggle). Copy voice from §07/§08: the headline
// reads the data back; no welcome language.
export const dynamic = "force-dynamic";

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const MONTH_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function headlineFor(
  thisMonth: MonthlyCategoryTotal[],
  lastMonth: MonthlyCategoryTotal[],
  lastMonthName: string,
): string {
  if (thisMonth.length === 0) return "Nothing scanned this month.";
  const top = [...thisMonth].sort((a, b) => b.total_cents - a.total_cents)[0];
  const prev = lastMonth.find((c) => c.category === top.category);
  let comparison = "";
  if (prev && prev.total_cents !== top.total_cents) {
    const delta = top.total_cents - prev.total_cents;
    comparison = ` — ${delta > 0 ? "up" : "down"} ${formatMoney(Math.abs(delta))} from ${lastMonthName}`;
  }
  return `${top.category} was your biggest category. ${formatMoney(top.total_cents)}${comparison}.`;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { empty?: string };
}) {
  // First visit → onboarding (screen 10). GetStarted sets the cookie.
  if (!cookies().get("recly_onboarded")) redirect("/welcome");

  // ?empty=1 previews the zero-receipt state without touching stored data —
  // it swaps in empty data and everything below renders the exact branch a
  // genuinely empty account hits. Same convention as /scan?fixture=1.
  const { monthlyTotals, monthlyCategoryTotals, recentReceipts } =
    searchParams.empty === "1"
      ? { monthlyTotals: [], monthlyCategoryTotals: [], recentReceipts: [] }
      : await fetchDashboardData();

  const now = new Date();
  const thisMonthKey = monthKey(now);
  const lastMonthKey = previousMonthKey(now);
  const lastMonthName = MONTH_SHORT.format(new Date(lastMonthKey));

  const thisMonth = monthlyTotals.find((m) => m.month === thisMonthKey);
  const thisMonthCategories = monthlyCategoryTotals.filter(
    (c) => c.month === thisMonthKey,
  );
  const lastMonthCategories = monthlyCategoryTotals.filter(
    (c) => c.month === lastMonthKey,
  );
  const monthTotalCents = thisMonth?.total_cents ?? 0;

  const categoryRows = [...thisMonthCategories].sort(
    (a, b) => b.total_cents - a.total_cents,
  );

  const trendPoints = monthlyTotals.map((m) => ({
    label: MONTH_SHORT.format(new Date(m.month)),
    cents: m.total_cents,
    isCurrentMonth: m.month === thisMonthKey,
  }));

  const empty = monthlyTotals.length === 0;

  // Screen 01 — empty dashboard. Structure from Figma node 1:1925 (hero
  // zero-state + FAB per the §09 component inventory; the inline CTA and
  // bottom nav are off-inventory). Copy: §06 playful tagline (documented
  // empty-state usage) + §08 stats format. No month header — there is no
  // data to read back, and deadpan means not announcing an empty month.
  if (empty) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-6">
        <div className="inline-flex flex-col self-start">
          <span className="text-heading-md lowercase">recly</span>
          <ScanMark size="sm" style={{ marginTop: -1 }} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-border">
            <ReceiptText className="h-8 w-8 text-ink-tertiary" />
          </span>
          <h1 className="mt-2 text-heading-lg">Your receipts, recly.</h1>
          <p className="font-mono text-data text-ink-secondary">
            0 receipts · $0.00
          </p>
          <p className="text-body text-ink-secondary">Scan the first one.</p>
        </div>

        <ScanFab />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="inline-flex flex-col">
        <span className="text-heading-md lowercase">recly</span>
        <ScanMark size="sm" style={{ marginTop: -1 }} />
      </div>

      <header className="mt-6">
        <p className="text-label uppercase text-ink-secondary">
          {MONTH_LABEL.format(now)}
        </p>
        <h1 className="mt-1 text-heading-lg">
          {headlineFor(thisMonthCategories, lastMonthCategories, lastMonthName)}
        </h1>
      </header>

      <>
          <section className="mt-6 rounded-xl border border-border bg-surface-card p-5">
            <p className="text-label uppercase text-ink-secondary">Total spent</p>
            <p className="mt-2 font-mono text-[40px] leading-none">
              {formatMoney(monthTotalCents)}
            </p>
            <p className="mt-3 font-mono text-data text-ink-secondary">
              {thisMonth
                ? `${thisMonth.item_count} items · ${thisMonth.trip_count} ${
                    thisMonth.trip_count === 1 ? "trip" : "trips"
                  } scanned`
                : "0 trips scanned"}
            </p>
          </section>

          <section className="mt-8">
            <SectionHeading>Spending trend</SectionHeading>
            <div className="mt-3 rounded-xl border border-border bg-surface-card p-4">
              <TrendChart points={trendPoints} />
            </div>
          </section>

          {categoryRows.length > 0 && (
            <section className="mt-8">
              <SectionHeading>Category breakdown</SectionHeading>
              <div className="mt-3 rounded-xl border border-border bg-surface-card">
                {categoryRows.map((row) => (
                  <Link
                    key={row.category}
                    href={`/category/${row.category.toLowerCase()}`}
                    className="flex items-center gap-3 border-b border-border-light p-4 transition-colors last:border-b-0 hover:bg-surface-faint"
                  >
                    <CategoryDot category={row.category} />
                    <span className="text-body lowercase">{row.category}</span>
                    <span className="ml-auto font-mono text-data">
                      {formatMoney(row.total_cents)}
                    </span>
                    <span className="w-10 text-right font-mono text-data-sm text-ink-secondary">
                      {monthTotalCents > 0
                        ? `${Math.round((row.total_cents / monthTotalCents) * 100)}%`
                        : "—"}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <SectionHeading>Recent receipts</SectionHeading>
            <div className="mt-3 rounded-xl border border-border bg-surface-card">
              {recentReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center gap-3 border-b border-border-light p-4 last:border-b-0"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-faint">
                    <ReceiptText className="h-4 w-4 text-ink-secondary" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-body font-medium">
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
                </div>
              ))}
            </div>
          </section>
      </>

      <ScanFab />
    </main>
  );
}
