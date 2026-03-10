"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SaveEvent({ eventId }: { eventId: string }) {
  useEffect(() => {
    localStorage.setItem("streetcat_event_id", eventId);
  }, [eventId]);
  return null;
}

export function ClearEventButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        localStorage.removeItem("streetcat_event_id");
        router.replace("/");
      }}
      className="btn-primary text-sm mt-4"
    >
      {label}
    </button>
  );
}
