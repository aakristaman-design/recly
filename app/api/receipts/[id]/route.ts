import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Removes a saved receipt; receipt_items go with it (FK ON DELETE CASCADE).
// Whole-receipt delete only — post-save item edits stay out of scope.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", params.id)
    .select("id");

  if (error) {
    console.error("delete receipt failed:", error.message);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 502 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ id: params.id });
}
