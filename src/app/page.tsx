"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const EVENT_KEY = "streetcat_event_id";

export default function Home() {
  const t = useTranslations("home");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(EVENT_KEY);
    if (saved) {
      router.replace(`/menu/${saved}`);
    } else {
      setReady(true);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    localStorage.setItem(EVENT_KEY, trimmed);
    router.push(`/menu/${trimmed}`);
  };

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="animate-fade-up w-full max-w-xs space-y-8">
        <img src="/logo.png" alt="StreetCat" className="mx-auto h-24 w-24 rounded-full" />
        <div>
          <h1 className="font-heading text-4xl font-bold text-accent-gold">
            街猫酒吧
          </h1>
          <p className="mt-2 text-text-secondary">StreetCat Bar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("codePlaceholder")}
            className="input w-full text-center tracking-widest"
          />
          <button type="submit" className="btn-primary w-full">
            {t("enter")}
          </button>
        </form>
      </div>
    </div>
  );
}
