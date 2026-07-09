import { NextResponse } from "next/server";
import OpenAI from "openai";
import { scanResultSchema, scanResultJsonSchema, CATEGORIES } from "@/lib/receipt-schema";
import { prepareReceiptImage } from "@/lib/receipt-image";

export const runtime = "nodejs";
// GPT-4o Vision calls run 5–20s; Vercel's default function window is too short.
export const maxDuration = 60;

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SYSTEM_PROMPT = `You extract structured data from photos of retail receipts, most often grocery receipts.

Work in two steps inside the JSON:
1. transcript: transcribe every printed line of the receipt exactly as printed, top to bottom, one line per row. Copy characters faithfully — do not normalize, expand, or guess. Pay close attention to quantity markers like "2@" and to two-digit years.
2. Then fill the remaining fields using only what appears in your transcript.

Rules:
- Extract every purchased line item, including fees printed as line items (bag charges, bottle deposits, CRV).
- Exclude: subtotal, tax, total, payment, change, loyalty-points, and savings-summary lines.
- quantity: integer count of units. A quantity prefix like "2@" or "3 @" means that many units — e.g. a line reading "2@ GRAN SMITH APPLES  Price 3.98  You Pay 3.00" is quantity 2, line total 3.00, unit_price 1.50. The "@" is a quantity marker, never part of the item name. Weighted items (e.g. "1.24 lb @ $2.99/lb") are quantity 1.
- unit_price: the price per unit actually paid, in dollars, so that quantity × unit_price equals what the customer paid for that line. When both a shelf "Price" column and a paid amount ("You Pay", or an amount after a member/card savings line) are printed, always use the paid amount, never the shelf price. For weighted items, unit_price is the full line price.
- name: short readable name in title case, taken from the printed text. Expand only obvious abbreviations. Never invent items that are not printed.
- category: exactly one of ${CATEGORIES.join(", ")}. Coverage: Produce = fresh and frozen fruit and vegetables; Dairy & Eggs = milk, cheese, butter, yogurt, eggs, ice cream; Meat & Seafood = meat, poultry, fish; Bakery = bread, bagels, tortillas, baked goods; Pantry = pasta, rice, legumes, canned goods, condiments, cooking oil, seasonings, sauces, baking mixes, frozen ready meals and pizza; Beverages = soda, juice, water, coffee, tea; Snacks = chips, candy, cookies, crackers; Household = cleaning products, paper goods, toiletries, and every fee or non-food item; Dining Out = restaurant, takeout, and delivery orders.
- Categorize by what the food fundamentally is, never by where the store shelves or stores it: frozen vegetables are Produce like fresh ones; a frozen multi-ingredient ready meal is Pantry. Storage method is never a category signal.
- store: the merchant name as printed (e.g. "Safeway", "Trader Joe's"). null if not visible.
- date: the purchase date as YYYY-MM-DD. US receipts print dates as MM/DD/YY where YY is a two-digit year meaning 20YY — copy the printed digits exactly (e.g. 07/05/26 is 2026-07-05). null if not visible.
- total: the final amount paid as printed (grand total or balance), in dollars. null if not visible.
- The photo may be rotated or at an angle; read the text in whatever orientation it runs.
- If the image is not a receipt, or is too blurry or dark to read line items, set readable to false, items to an empty array, and all other fields to null.`;

function errorResponse(status: number, code: string) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request) {
  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return errorResponse(400, "BAD_REQUEST");
  }

  if (!file || !ACCEPTED_TYPES.includes(file.type)) {
    return errorResponse(400, "BAD_REQUEST");
  }
  if (file.size > MAX_FILE_BYTES) {
    return errorResponse(413, "FILE_TOO_LARGE");
  }

  let dataUrl: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const prepared = await prepareReceiptImage(buffer);
    dataUrl = `data:image/jpeg;base64,${prepared.toString("base64")}`;
  } catch {
    return errorResponse(422, "UNREADABLE");
  }

  const openai = new OpenAI();
  let content: string | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: scanResultJsonSchema },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    });
    const message = completion.choices[0]?.message;
    if (message?.refusal) return errorResponse(422, "UNREADABLE");
    content = message?.content ?? null;
  } catch (err) {
    console.error("scan-receipt upstream error:", err);
    return errorResponse(502, "UPSTREAM_ERROR");
  }

  if (!content) return errorResponse(502, "UPSTREAM_ERROR");

  // Structured outputs should guarantee shape; validate anyway so a
  // malformed response degrades to a typed error the UI can handle.
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return errorResponse(422, "PARSE_FAILED");
  }
  const result = scanResultSchema.safeParse(parsed);
  if (!result.success) return errorResponse(422, "PARSE_FAILED");
  if (!result.data.readable || result.data.items.length === 0) {
    return errorResponse(422, "UNREADABLE");
  }

  return NextResponse.json({ receipt: result.data });
}
