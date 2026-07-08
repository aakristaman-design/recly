import { createPublicSupabase } from "@/lib/supabase-public";
import type { Category } from "@/lib/receipt-schema";

// All dashboard numbers come from the SQL views (v2.0 §12): the frontend
// renders aggregates, it never computes insights from raw OCR output.

export type MonthlyTotal = {
  month: string; // YYYY-MM-DD, first of month
  total_cents: number;
  trip_count: number;
  item_count: number;
};

export type MonthlyCategoryTotal = {
  month: string;
  category: Category;
  total_cents: number;
};

export type ReceiptSummary = {
  id: string;
  store: string | null;
  purchased_on: string;
  scanned_at: string;
  printed_total_cents: number | null;
  item_count: number;
  items_total_cents: number;
};

export type DashboardData = {
  monthlyTotals: MonthlyTotal[];
  monthlyCategoryTotals: MonthlyCategoryTotal[];
  recentReceipts: ReceiptSummary[];
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createPublicSupabase();
  const [monthly, monthlyCategory, recent] = await Promise.all([
    supabase.from("monthly_totals").select("*").order("month"),
    supabase.from("monthly_category_totals").select("*"),
    supabase
      .from("receipt_summaries")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(5),
  ]);

  return {
    monthlyTotals: (monthly.data ?? []) as MonthlyTotal[],
    monthlyCategoryTotals: (monthlyCategory.data ?? []) as MonthlyCategoryTotal[],
    recentReceipts: (recent.data ?? []) as ReceiptSummary[],
  };
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function previousMonthKey(date: Date): string {
  return monthKey(new Date(date.getFullYear(), date.getMonth() - 1, 1));
}
