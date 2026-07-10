import { cn } from "@/lib/utils";
import type { Category } from "@/lib/receipt-schema";

// One dedicated accent per category (Decision 5; palette per addendum v1.1
// plus Pets, July 2026) — the dot is the visual shortcut; the label does
// the naming.
export const CATEGORY_HEX: Record<Category, string> = {
  Produce: "#4A9E6B",
  "Dairy & Eggs": "#4A7EC4",
  "Meat & Seafood": "#D4697A",
  Bakery: "#E8A830",
  Pantry: "#B08968",
  Beverages: "#5FA8A0",
  Snacks: "#E07840",
  Household: "#8B6EC4",
  Pets: "#C4915C",
  "Dining Out": "#8A877F",
};

const DOT_CLASS: Record<Category, string> = {
  Produce: "bg-category-produce",
  "Dairy & Eggs": "bg-category-dairy",
  "Meat & Seafood": "bg-category-meat",
  Bakery: "bg-category-bakery",
  Pantry: "bg-category-pantry",
  Beverages: "bg-category-beverages",
  Snacks: "bg-category-snacks",
  Household: "bg-category-household",
  Pets: "bg-category-pets",
  "Dining Out": "bg-category-dining-out",
};

export function CategoryDot({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        DOT_CLASS[category],
        className,
      )}
    />
  );
}
