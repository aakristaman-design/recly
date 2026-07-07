import { z } from "zod";

// The six locked categories (v2.0 §04). OCR must choose one per item;
// the parsed-receipt screen is where the user corrects wrong guesses.
export const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Snacks",
  "Household",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const receiptItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  // price per unit actually paid, so quantity × unit_price = line total
  unit_price: z.number().nonnegative(),
  category: z.enum(CATEGORIES),
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
});

export type ReceiptItem = z.infer<typeof receiptItemSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;

// Same shape as scanResultSchema, expressed as a strict JSON schema for
// OpenAI structured outputs — guarantees schema-valid JSON from the model.
export const scanResultJsonSchema = {
  name: "receipt_scan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["transcript", "readable", "store", "date", "total", "items"],
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
    },
  },
} as const;
