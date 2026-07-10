"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

// Whole-receipt delete for the history screen (screen 09). Destructive, so
// it takes two taps: the first swaps in an inline confirm row stating what
// goes (§07: data first, no exclamation); nothing leaves Supabase until the
// second. Collapsing the row (or tapping cancel) backs out.
export function DeleteReceiptButton({
  receiptId,
  itemCount,
}: {
  receiptId: string;
  itemCount: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const handleDelete = async () => {
    setError(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
      setDeleting(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-2 p-4 text-body text-ink-secondary transition-colors hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
        Delete this receipt
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-danger-bg p-4">
      <p className="text-body text-ink">
        {error
          ? "Couldn't delete that receipt. Try again."
          : `Deletes this receipt and its ${itemCount} ${
              itemCount === 1 ? "item" : "items"
            }. There's no undo.`}
      </p>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(false);
          }}
          disabled={deleting}
          className="rounded-md px-3 py-1.5 text-body text-ink-secondary transition-colors hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="rounded-md bg-danger px-3 py-1.5 text-body font-medium text-danger-bg transition-colors hover:bg-danger/90 disabled:opacity-50"
        >
          {deleting ? "Deleting" : "Delete"}
        </button>
      </div>
    </div>
  );
}
