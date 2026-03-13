"use client";

import { useState } from "react";

export function EventAdminTabs({
  eventId,
  manageContent,
}: {
  eventId: string;
  manageContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<"manage" | "preview">("manage");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("manage")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "manage"
              ? "bg-accent-gold/20 text-accent-gold"
              : "text-text-muted hover:text-accent-gold"
          }`}
        >
          Manage
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "preview"
              ? "bg-accent-gold/20 text-accent-gold"
              : "text-text-muted hover:text-accent-gold"
          }`}
        >
          Menu Preview
        </button>
      </div>

      {tab === "manage" ? (
        manageContent
      ) : (
        <div className="flex justify-center">
          <div className="w-[390px] h-[844px] rounded-2xl border-2 border-border-gold overflow-hidden">
            <iframe
              src={`/menu/${eventId}`}
              className="w-full h-full"
              title="Menu Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
