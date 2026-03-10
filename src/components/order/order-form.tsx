"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { placeOrder } from "@/lib/actions/orders";

const GUEST_NAME_KEY = "streetcat_guest_name";

type MenuItem = {
  id: string;
  name: string;
};

export function OrderForm({
  eventId,
  menuItems,
}: {
  eventId: string;
  menuItems: MenuItem[];
}) {
  const t = useTranslations("order");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savedName, setSavedName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const name = localStorage.getItem(GUEST_NAME_KEY) || "";
    setSavedName(name);
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <form
      action={async (formData: FormData) => {
        const name = formData.get("guestName") as string;
        if (name) localStorage.setItem(GUEST_NAME_KEY, name);
        const items = Object.entries(quantities)
          .filter(([_, qty]) => qty > 0)
          .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
        formData.set("items", JSON.stringify(items));
        await placeOrder(formData);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="eventId" value={eventId} />

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary">
          {t("guestName")}
        </label>
        <input
          ref={nameRef}
          type="text"
          name="guestName"
          required
          defaultValue={savedName}
          key={savedName}
          placeholder={t("guestNamePlaceholder")}
          className="input mt-1"
        />
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          {t("selectDrinks")}
        </h3>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-border-gold last:border-0"
            >
              <span className="font-heading text-text-primary">
                {item.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-8 h-8 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center text-accent-gold font-semibold">
                  {quantities[item.id] || 0}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 rounded-full border border-border-gold-strong text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={totalItems === 0}
        className="btn-primary w-full"
      >
        {t("placeOrder")} {totalItems > 0 && `(${totalItems})`}
      </button>
    </form>
  );
}
