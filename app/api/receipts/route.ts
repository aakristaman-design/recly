import { NextResponse } from "next/server";
import { saveReceiptSchema } from "@/lib/receipt-schema";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

// Persists a corrected receipt (Decision 2: only user-confirmed data reaches
// the database — analytics run on clean rows, never raw OCR output).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = saveReceiptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_RECEIPT" }, { status: 422 });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED" }, { status: 503 });
  }

  const { store, date, total_cents, items } = parsed.data;
  const { data, error } = await supabase.rpc("save_receipt", {
    p_store: store,
    p_purchased_on: date,
    p_total_cents: total_cents,
    p_items: items,
  });

  if (error) {
    console.error("save_receipt failed:", error.message);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 502 });
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
