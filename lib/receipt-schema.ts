import { z } from "zod";

// The ten locked categories (category addendum v1.1's nine, plus Pets —
// July 2026, part of expanding Recly from strictly-grocery to general
// household shopping). OCR must choose one per item; the parsed-receipt
// screen is where the user corrects wrong guesses.
export const CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery",
  "Pantry",
  "Beverages",
  "Snacks",
  "Household",
  "Pets",
  "Dining Out",
] as const;

export type Category = (typeof CATEGORIES)[number];

// URL slugs, from the addendum's token names (category/dining-out etc.).
export const CATEGORY_SLUG: Record<Category, string> = {
  Produce: "produce",
  "Dairy & Eggs": "dairy",
  "Meat & Seafood": "meat",
  Bakery: "bakery",
  Pantry: "pantry",
  Beverages: "beverages",
  Snacks: "snacks",
  Household: "household",
  Pets: "pets",
  "Dining Out": "dining-out",
};

export function categoryFromSlug(slug: string): Category | undefined {
  const lower = slug.toLowerCase();
  return CATEGORIES.find((c) => CATEGORY_SLUG[c] === lower);
}

// Rows written under the six-category taxonomy keep their stored values
// (v1.1: rename-on-read, no backfill). SQL views normalize for aggregation;
// this covers direct table reads.
export function normalizeCategory(raw: string): Category {
  if (raw === "Dairy") return "Dairy & Eggs";
  if (raw === "Meat") return "Meat & Seafood";
  return (CATEGORIES as readonly string[]).includes(raw)
    ? (raw as Category)
    : "Household";
}

export const receiptItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  // price per unit actually paid, so quantity × unit_price = line total
  unit_price: z.number().nonnegative(),
  category: z.enum(CATEGORIES),
});

// Order-level total-area lines printed between the item subtotal and the
// grand total: coupon savings, subscription savings, tax, order-level fees.
// Signed dollars — discounts negative, charges positive — so that
// items sum + adjustments sum = grand total. Display-only (the total-area
// summary on the parsed-receipt screen); never attributed to items and
// never persisted per-item.
export const receiptAdjustmentSchema = z.object({
  label: z.string().min(1),
  amount: z.number(),
});

export const scanResultSchema = z.object({
  // generated first (schema order) — forces line-by-line transcription
  // before extraction, grounding item fields in the transcribed text
  transcript: z.string(),
  readable: z.boolean(),
  store: z.string().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  total: z.number().nullable(),
  items: z.array(receiptItemSchema),
  adjustments: z.array(receiptAdjustmentSchema),
});

export type ReceiptItem = z.infer<typeof receiptItemSchema>;
export type ReceiptAdjustment = z.infer<typeof receiptAdjustmentSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;

// POST /api/receipts body — corrected receipt as the user confirmed it.
// Money travels as integer cents; the DB stores cents.
export const saveReceiptSchema = z.object({
  store: z.string().trim().min(1).nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  total_cents: z.number().int().nonnegative().nullable(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        quantity: z.number().int().min(1),
        unit_price_cents: z.number().int().nonnegative(),
        category: z.enum(CATEGORIES),
      }),
    )
    .min(1),
});

export type SaveReceiptRequest = z.infer<typeof saveReceiptSchema>;

// Same shape as scanResultSchema, expressed as a strict JSON schema for
// OpenAI structured outputs — guarantees schema-valid JSON from the model.
export const scanResultJsonSchema = {
  name: "receipt_scan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "transcript",
      "readable",
      "store",
      "date",
      "total",
      "items",
      "adjustments",
    ],
    properties: {
      transcript: { type: "string" },
      readable: { type: "boolean" },
      store: { type: ["string", "null"] },
      date: { type: ["string", "null"] },
      total: { type: ["number", "null"] },
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "quantity", "unit_price", "category"],
          properties: {
            name: { type: "string" },
            quantity: { type: "integer" },
            unit_price: { type: "number" },
            category: { type: "string", enum: [...CATEGORIES] },
          },
        },
      },
      adjustments: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "amount"],
          properties: {
            label: { type: "string" },
            amount: { type: "number" },
          },
        },
      },
    },
  },
} as const;
