"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { CategoryDot } from "@/components/brand/category-dot";
import { CATEGORIES, type Category } from "@/lib/receipt-schema";

// Inline category correction (Decision 2/3): the pill is the control itself —
// one tap opens the six options, no edit mode to enter.
export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Category)}>
      <SelectTrigger
        aria-label="Category"
        className="h-7 w-auto gap-1.5 rounded-full border-border-light bg-surface-faint px-3 text-body shadow-none focus:ring-green"
      >
        <CategoryDot category={value} />
        <span className="lowercase">{value}</span>
      </SelectTrigger>
      <SelectContent className="min-w-0">
        {CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            <span className="flex items-center gap-2">
              <CategoryDot category={category} />
              <span className="lowercase">{category}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
