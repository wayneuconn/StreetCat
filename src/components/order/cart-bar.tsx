"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useTranslations } from "next-intl";

export function CartBar() {
  const { totalItems } = useCart();
  const t = useTranslations("order");

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-bg-secondary/95 backdrop-blur border-t border-border-gold">
      <div className="max-w-lg mx-auto">
        <Link
          href="/order"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-sm font-bold">
            {totalItems}
          </span>
          {t("viewCart")}
        </Link>
      </div>
    </div>
  );
}
