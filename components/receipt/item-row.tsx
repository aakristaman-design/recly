"use client";

import { Minus, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategorySelect } from "@/components/receipt/category-select";
import type { Category } from "@/lib/receipt-schema";
import { formatMoney, lineTotalCents } from "@/lib/money";
import { cn } from "@/lib/utils";

// One receipt line. Always editable — no edit mode (Decision 3). Name and
// price are inputs styled as text with a visible faint field; quantity is a
// stepper; category is a one-tap pill.
export type EditableItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string; // kept as the raw input string while typing
  category: Category;
};

type ItemRowProps = {
  item: EditableItem;
  onChange: (patch: Partial<EditableItem>) => void;
  onRemove: () => void;
};

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-light bg-surface-faint text-ink-secondary transition-colors hover:border-border hover:text-ink"
    >
      {children}
    </button>
  );
}

export function ItemRow({ item, onChange, onRemove }: ItemRowProps) {
  return (
    <div className="border-b border-border-light bg-surface-card p-4 first:rounded-t-xl last:rounded-b-xl last:border-b-0">
      <div className="flex items-center gap-2">
        <Input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-label="Item name"
          placeholder="Item name"
          className="h-8 flex-1 rounded-md border-transparent bg-transparent px-1.5 text-body shadow-none transition-colors hover:bg-surface-faint focus-visible:bg-surface-faint focus-visible:ring-1 focus-visible:ring-green"
        />
        <button
          type="button"
          aria-label={`Remove ${item.name || "item"}`}
          onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-danger-bg hover:text-danger"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StepButton
          label="Decrease quantity"
          onClick={() => onChange({ quantity: Math.max(1, item.quantity - 1) })}
        >
          <Minus className="h-3 w-3" />
        </StepButton>
        <span className="w-8 text-center font-mono text-data" aria-label="Quantity">
          {item.quantity}
        </span>
        <StepButton
          label="Increase quantity"
          onClick={() => onChange({ quantity: item.quantity + 1 })}
        >
          <Plus className="h-3 w-3" />
        </StepButton>

        <span className="text-caption text-ink-tertiary">×</span>

        <span className="flex items-center gap-0.5">
          <span className="text-data text-ink-secondary">$</span>
          <Input
            value={item.unitPrice}
            onChange={(e) => onChange({ unitPrice: e.target.value })}
            inputMode="decimal"
            aria-label="Unit price"
            className="h-8 w-16 rounded-md border-transparent bg-surface-faint px-1.5 font-mono text-data shadow-none focus-visible:ring-1 focus-visible:ring-green"
          />
        </span>

        <span
          className={cn(
            "ml-auto font-mono text-base",
            lineTotalCents(item) === null && "text-ink-tertiary",
          )}
        >
          {formatMoney(lineTotalCents(item) ?? 0)}
        </span>
      </div>

      <div className="mt-3">
        <CategorySelect
          value={item.category}
          onChange={(category) => onChange({ category })}
        />
      </div>
    </div>
  );
}
