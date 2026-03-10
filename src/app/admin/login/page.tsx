"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const t = useTranslations("admin.login");
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-sm animate-fade-up">
        <h1 className="font-heading text-2xl font-bold text-accent-gold text-center mb-6">
          {t("title")}
        </h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder={t("passwordPlaceholder")}
              className="input"
              autoFocus
            />
          </div>
          {state?.error && (
            <p className="text-sm text-accent-burgundy">{t("error")}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? "..." : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
