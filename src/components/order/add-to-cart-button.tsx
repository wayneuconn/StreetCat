"use client";

import { useCart } from "@/hooks/use-cart";
import { useTranslations } from "next-intl";

export function AddToCartButton({
  menuItemId,
  name,
  eventId,
}: {
  menuItemId: string;
  name: string;
  eventId: string;
}) {
  const { addItem, removeItem, getQuantity } = useCart();
  const t = useTranslations("order");
  const qty = getQuantity(menuItemId);

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem(menuItemId, name, eventId)}
        className="btn-primary w-full"
      >
        {t("addToCart")}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => removeItem(menuItemId)}
        className="w-10 h-10 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors text-lg"
      >
        -
      </button>
      <span className="w-8 text-center text-accent-gold font-heading text-xl font-bold">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => addItem(menuItemId, name, eventId)}
        className="w-10 h-10 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors text-lg"
      >
        +
      </button>
    </div>
  );
}
