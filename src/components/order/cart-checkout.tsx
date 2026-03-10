"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/use-cart";
import { placeOrder } from "@/lib/actions/orders";
import Link from "next/link";

const GUEST_NAME_KEY = "streetcat_guest_name";

export function CartCheckout() {
  const t = useTranslations("order");
  const tMenu = useTranslations("menu");
  const { items, eventId, addItem, removeItem, clearCart, totalItems } =
    useCart();
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem(GUEST_NAME_KEY) || "";
    setSavedName(name);
  }, []);

  const menuLink = eventId ? `/menu/${eventId}` : "/";

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-text-muted text-lg">{t("emptyCart")}</p>
        <Link href={menuLink} className="btn-primary inline-block">
          {tMenu("title")}
        </Link>
      </div>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        const name = formData.get("guestName") as string;
        if (name) localStorage.setItem(GUEST_NAME_KEY, name);
        const orderItems = items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        }));
        formData.set("items", JSON.stringify(orderItems));
        formData.set("eventId", eventId!);
        clearCart();
        await placeOrder(formData);
      }}
      className="space-y-4"
    >
      <Link
        href={menuLink}
        className="text-sm text-text-muted hover:text-accent-gold transition-colors"
      >
        &larr; {t("backToMenu")}
      </Link>

      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("title")}
        </h1>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary">
          {t("guestName")}
        </label>
        <input
          type="text"
          name="guestName"
          required
          defaultValue={savedName}
          key={savedName}
          placeholder={t("guestNamePlaceholder")}
          className="input mt-1"
        />
      </div>

      <div className="card space-y-3">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex items-center justify-between py-2 border-b border-border-gold last:border-0"
          >
            <span className="font-heading text-text-primary flex-1">
              {item.name}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => removeItem(item.menuItemId)}
                className="w-8 h-8 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors"
              >
                -
              </button>
              <span className="w-6 text-center text-accent-gold font-semibold">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => addItem(item.menuItemId, item.name, eventId!)}
                className="w-8 h-8 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="btn-primary w-full">
        {t("placeOrder")} ({totalItems})
      </button>
    </form>
  );
}
