"use client";

import { useState } from "react";

export function EventAdminTabs({
  menuContent,
  manageContent,
}: {
  menuContent: React.ReactNode;
  manageContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<"menu" | "manage">("menu");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("menu")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "menu"
              ? "bg-accent-gold/20 text-accent-gold"
              : "text-text-muted hover:text-accent-gold"
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setTab("manage")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "manage"
              ? "bg-accent-gold/20 text-accent-gold"
              : "text-text-muted hover:text-accent-gold"
          }`}
        >
          Dashboard
        </button>
      </div>

      {tab === "menu" ? menuContent : manageContent}
    </div>
  );
}
