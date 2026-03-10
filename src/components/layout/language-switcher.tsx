"use client";

import { useLocale } from "next-intl";
import { switchLocaleAction } from "@/lib/actions/locale";

export function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <form action={switchLocaleAction}>
      <button
        type="submit"
        className="rounded-md border border-border-gold px-2 py-1 text-xs text-text-muted hover:text-accent-gold hover:border-accent-gold transition-colors"
      >
        {locale === "zh" ? "EN" : "中"}
      </button>
    </form>
  );
}
