"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/lib/actions/auth";

const adminLinks = [
  { href: "/admin", key: "nav.dashboard" },
  { href: "/admin/queue", key: "nav.queue" },
  { href: "/admin/inventory", key: "nav.inventory" },
  { href: "/admin/recipes", key: "nav.recipes" },
  { href: "/admin/events", key: "nav.events" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border-gold bg-bg-primary/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/admin" className="font-heading text-lg font-bold text-accent-gold">
            {t("common.appName")}
          </Link>
          <div className="flex items-center gap-3">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
              >
                {t("nav.logout")}
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-4xl overflow-x-auto px-4 pb-2">
          <div className="flex gap-1 text-sm">
            {adminLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                    isActive
                      ? "bg-accent-gold/15 text-accent-gold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
