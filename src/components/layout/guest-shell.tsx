"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function GuestShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border-gold bg-bg-primary/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="font-heading text-lg font-bold text-accent-gold">
            {t("common.appName")}
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex gap-3 text-sm">
              <Link
                href="/menu"
                className="text-text-secondary hover:text-accent-gold transition-colors"
              >
                {t("nav.menu")}
              </Link>
              <Link
                href="/order"
                className="text-text-secondary hover:text-accent-gold transition-colors"
              >
                {t("nav.order")}
              </Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
