"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/use-cart";
import { CartBar } from "@/components/order/cart-bar";

export function GuestShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { eventId } = useCart();

  // Try cart eventId first, then localStorage
  const menuLink = eventId
    ? `/menu/${eventId}`
    : typeof window !== "undefined"
      ? `/menu/${localStorage.getItem("streetcat_event_id") || ""}`
      : "/";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border-gold bg-bg-primary/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href={menuLink} className="flex items-center gap-2 font-heading text-lg font-bold text-accent-gold">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-full" />
            {t("common.appName")}
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 pb-24">
        {children}
      </main>
      <CartBar />
    </div>
  );
}
