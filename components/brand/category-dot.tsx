import { cn } from "@/lib/utils";
import type { Category } from "@/lib/receipt-schema";

// One dedicated accent per category (v2.0 §04, Decision 5) — the dot is the
// visual shortcut; the label does the naming.
const DOT_CLASS: Record<Category, string> = {
  Produce: "bg-category-produce",
  Dairy: "bg-category-dairy",
  Meat: "bg-category-meat",
  Bakery: "bg-category-bakery",
  Snacks: "bg-category-snacks",
  Household: "bg-category-household",
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
