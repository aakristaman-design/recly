import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategoryDot, CATEGORY_HEX } from "@/components/brand/category-dot";
import { ScanFab } from "@/components/brand/scan-fab";
import { SectionHeading } from "@/components/brand/section-heading";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { createPublicSupabase } from "@/lib/supabase-public";
import { monthKey } from "@/lib/dashboard-data";
import { formatMoney } from "@/lib/money";
import { CATEGORIES, type Category } from "@/lib/receipt-schema";

// Screen 07/08 — one route serves all six categories: the layout is
// identical, only the accent changes (Decision 5). Structure from Figma
// node 1:346; the off-spec bottom nav and advice-voiced "smart insight"
// are replaced per §07 (facts only, judgment never).
export const dynamic = "force-dynamic";

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const MONTH_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

type MonthRow = { month: string; total_cents: number; trip_count: number };
type ItemRow = {
  month: string;
  name: string;
  quantity: number;
  total_cents: number;
  trip_count: number;
};

export default async function CategoryDetail({
  params,
}: {
  params: { slug: string };
}) {
  const category = CATEGORIES.find(
    (c) => c.toLowerCase() === params.slug.toLowerCase(),
  ) as Category | undefined;
  if (!category) notFound();

  const supabase = createPublicSupabase();
  const now = new Date();
  const thisMonthKey = monthKey(now);

  const [months, items, monthTotals] = await Promise.all([
    supabase
      .from("monthly_category_totals")
      .select("month,total_cents,trip_count")
      .eq("category", category)
      .order("month"),
    supabase
      .from("category_item_totals")
      .select("month,name,quantity,total_cents,trip_count")
      .eq("category", category)
      .eq("month", thisMonthKey)
      .order("total_cents", { ascending: false }),
    supabase.from("monthly_totals").select("month,total_cents"),
  ]);

  const monthRows = (months.data ?? []) as MonthRow[];
  const itemRows = (items.data ?? []) as ItemRow[];
  const thisMonth = monthRows.find((m) => m.month === thisMonthKey);
  const monthTotalCents =
    ((monthTotals.data ?? []) as { month: string; total_cents: number }[]).find(
      (m) => m.month === thisMonthKey,
    )?.total_cents ?? 0;

  const accent = CATEGORY_HEX[category];
  const label = category.toLowerCase();
  const topItemCents = itemRows[0]?.total_cents ?? 0;
  const shareOfMonth =
    thisMonth && monthTotalCents > 0
      ? Math.round((thisMonth.total_cents / monthTotalCents) * 100)
      : null;

  const trendPoints = monthRows.map((m) => ({
    label: MONTH_SHORT.format(new Date(m.month)),
    cents: m.total_cents,
    isCurrentMonth: m.month === thisMonthKey,
  }));

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
        <h1 className="flex items-center gap-2 text-heading-lg">
          <CategoryDot category={category} className="h-2.5 w-2.5" />
          {label}
        </h1>
      </div>

      <p className="mt-4 text-label uppercase text-ink-secondary">
        {MONTH_LABEL.format(now)}
      </p>

      {monthRows.length === 0 ? (
        <p className="mt-4 text-body text-ink-secondary">
          Nothing in {label} yet.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <section className="rounded-xl border border-border bg-surface-card p-4">
              <p className="text-label uppercase text-ink-secondary">
                Total spent
              </p>
              <p className="mt-2 font-mono text-[24px] leading-none">
                {formatMoney(thisMonth?.total_cents ?? 0)}
              </p>
            </section>
            <section className="rounded-xl border border-border bg-surface-card p-4">
              <p className="text-label uppercase text-ink-secondary">
                Avg per trip
              </p>
              <p className="mt-2 font-mono text-[24px] leading-none">
                {thisMonth && thisMonth.trip_count > 0
                  ? formatMoney(
                      Math.round(thisMonth.total_cents / thisMonth.trip_count),
                    )
                  : "$0.00"}
              </p>
              <p className="mt-2 font-mono text-data-sm text-ink-secondary">
                {thisMonth
                  ? `across ${thisMonth.trip_count} ${
                      thisMonth.trip_count === 1 ? "trip" : "trips"
                    }`
                  : "no trips this month"}
              </p>
            </section>
          </div>

          {shareOfMonth !== null && (
            <p className="mt-3 rounded-xl border border-green-light bg-green-light/40 p-4 text-body text-green-dark">
              {shareOfMonth}% of everything you spent this month.
            </p>
          )}

          <section className="mt-8">
            <SectionHeading>Monthly trend</SectionHeading>
            <div className="mt-3 rounded-xl border border-border bg-surface-card p-4">
              <TrendChart points={trendPoints} color={accent} />
            </div>
          </section>

          {itemRows.length > 0 && (
            <section className="mt-8">
              <SectionHeading>Most purchased</SectionHeading>
              <div className="mt-3 rounded-xl border border-border bg-surface-card">
                {itemRows.map((item) => (
                  <div
                    key={item.name}
                    className="border-b border-border-light p-4 last:border-b-0"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-body font-medium">{item.name}</span>
                      <span className="ml-auto font-mono text-data">
                        {formatMoney(item.total_cents)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="text-caption text-ink-secondary">
                        Bought {item.trip_count}{" "}
                        {item.trip_count === 1 ? "time" : "times"} this month
                      </span>
                      <span className="ml-auto font-mono text-data-sm text-ink-secondary">
                        {formatMoney(Math.round(item.total_cents / item.quantity))}{" "}
                        avg
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-faint">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${topItemCents > 0 ? Math.max(4, Math.round((item.total_cents / topItemCents) * 100)) : 0}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ScanFab />
    </main>
  );
}
