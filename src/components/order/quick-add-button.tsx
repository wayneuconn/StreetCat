"use client";

import { useCart } from "@/hooks/use-cart";

export function QuickAddButton({
  menuItemId,
  name,
  eventId,
}: {
  menuItemId: string;
  name: string;
  eventId: string;
}) {
  const { addItem, removeItem, getQuantity } = useCart();
  const qty = getQuantity(menuItemId);

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.preventDefault()}
    >
      {qty > 0 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              removeItem(menuItemId);
            }}
            className="w-7 h-7 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors text-sm"
          >
            -
          </button>
          <span className="w-5 text-center text-accent-gold font-semibold text-sm">
            {qty}
          </span>
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          addItem(menuItemId, name, eventId);
        }}
        className="w-7 h-7 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors text-sm"
      >
        +
      </button>
    </div>
  );
}
