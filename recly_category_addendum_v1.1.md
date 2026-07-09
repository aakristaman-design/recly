# Recly — Brand Addendum: Category Taxonomy v1.1

**Status: locked.** This addendum supersedes v2.0 §04's category color list only. Every other section of `recly_complete_context.pdf` (v2.0) remains authoritative and unchanged. File this alongside v2.0 in the `Recly` folder as the current source of truth for categories.

**Date:** July 2026. **Reason for change:** testing against real scanned receipts (Safeway, others) surfaced that the original six categories couldn't honestly place common items — pasta, rice, condiments, cooking oil, soda, and takeout orders had no correct home. Rather than force-fit these into the nearest wrong category (the original build put pasta under Snacks), the taxonomy was expanded to nine categories, informed by conventional grocery/budgeting classification.

---

## Locked category list (replaces v2.0 §04's six-category table)

| Category | Covers | Hex | Token name |
|---|---|---|---|
| Produce | Fresh & frozen fruits and vegetables | `#4A9E6B` | `category/produce` *(unchanged)* |
| Dairy & Eggs | Milk, cheese, butter, yogurt, eggs, ice cream | `#4A7EC4` | `category/dairy` *(unchanged, renamed label)* |
| Meat & Seafood | Meat, poultry, fish | `#D4697A` | `category/meat` *(unchanged, renamed label)* |
| Bakery | Bread, bagels, tortillas, baked goods | `#E8A830` | `category/bakery` *(unchanged)* |
| Pantry | Pasta, rice, legumes, canned goods, condiments, cooking oil, seasonings, sauces, baking mixes, frozen meals/pizza | `#B08968` | `category/pantry` *(new)* |
| Beverages | Soda, juice, water, coffee, tea | `#5FA8A0` | `category/beverages` *(new)* |
| Snacks | Chips, candy, cookies, crackers (narrowed — no longer a catch-all) | `#E07840` | `category/snacks` *(unchanged)* |
| Household | Cleaning, paper goods, toiletries | `#8B6EC4` | `category/household` *(unchanged)* |
| Dining Out | Restaurant, takeout, delivery orders — optional, for users who want to track it alongside groceries | `#8A877F` | `category/dining-out` *(new — deliberately desaturated, reuses `text/secondary` tone, so it doesn't visually compete with the food categories)* |

**Classification rule:** categorize by what the food fundamentally *is*, not by where it was stored. Frozen vegetables/fruit → Produce (same as fresh). Frozen ready meals/pizza → Pantry (multi-ingredient, prepare-yourself). Storage method is never a category signal.

**Scope note on Dining Out:** this is the one category outside "grocery spend" (v2.0 §01's core positioning). It's included as an optional bucket for users who want takeout tracked alongside groceries, not as a pivot away from the grocery-first vertical. Keep it visually quiet (the desaturated grey) so it doesn't compete with the eight food/household categories for attention.

---

## What needs to change in the build

This is a propagation task, not a re-architecture — the same pattern used for the original six colors, extended.

1. **Tailwind tokens** — add `pantry`, `beverages`, `dining-out` alongside the existing six in whatever config holds the category color scale (from step 2 of the original build).
2. **OCR prompt category list** — the `/api/scan-receipt` extraction prompt currently constrains the model to six categories (per the original CHECK constraint). Update the enum/instruction to all nine, and give the model the classification rule above (fundamental food type, not storage) so it doesn't need examples for every edge case.
3. **Database CHECK constraint** — `receipt_items.category` is CHECK-constrained to the original six values (built in step 5). This needs a migration to allow the nine new values. Existing rows using the old values stay valid; nothing needs backfilling unless you want to manually recategorize your seed receipts.
4. **Everywhere a category already renders** — audit for hardcoded assumptions of six: the CategoryDot component, the dashboard's category breakdown rows, the category detail page (`/category/[slug]`), and the parsed-receipt correction pill (which lists all categories for the user to pick from).
5. **Re-run existing receipts through categorization, optionally** — your current seed receipts (including the pasta-under-Snacks example) were categorized under the old six-category prompt. You can leave them as historical/uncorrected (a legitimate demonstration of why the correction layer exists), or manually recategorize them via the correction UI now that Pantry exists. Either is defensible; this is a judgment call, not a bug to fix.

---

## Case study note

This taxonomy change is a genuine, honest design-iteration story: "I expanded the category system from six to nine categories after testing against my own real receipts surfaced items — pasta, condiments, soda — that didn't have a correct home in the original taxonomy." That's a real example of designing against real data rather than assumptions, worth a line in the case study's design decisions section.
