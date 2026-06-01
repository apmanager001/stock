"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ModalShell } from "@/components/ui/modal-shell";

type DashboardFormAction = (formData: FormData) => void | Promise<void>;

type WishlistDeleteModalProps = {
  stock: {
    symbol: string;
    name: string;
  } | null;
  onClose: () => void;
  removeFromWatchlistAction: DashboardFormAction;
};

type WishlistDeleteModalActionsProps = {
  onClose: () => void;
};

function WishlistDeleteModalActions({
  onClose,
}: WishlistDeleteModalActionsProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost rounded-full px-6"
        onClick={onClose}
        disabled={pending}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="btn btn-error rounded-full px-6 text-error-content"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {pending ? "Removing..." : "Remove stock"}
      </button>
    </>
  );
}

export function WishlistDeleteModal({
  stock,
  onClose,
  removeFromWatchlistAction,
}: WishlistDeleteModalProps) {
  if (!stock) {
    return null;
  }

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      title={`Remove ${stock.symbol} from your wishlist?`}
      description="This only removes the stock from your saved wishlist. You can add it back any time."
    >
      <div className="space-y-6">
        <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/78 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
            Selected stock
          </p>
          <p className="mt-3 text-lg font-semibold text-base-content">
            {stock.symbol}
          </p>
          <p className="mt-1 text-sm text-base-content/60">{stock.name}</p>
        </div>

        <form
          action={removeFromWatchlistAction}
          className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          aria-busy={stock ? undefined : false}
        >
          <input type="hidden" name="symbol" value={stock.symbol} />

          <WishlistDeleteModalActions onClose={onClose} />
        </form>
      </div>
    </ModalShell>
  );
}
