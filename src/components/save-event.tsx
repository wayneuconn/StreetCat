"use client";

import { useEffect } from "react";

export function SaveEvent({ eventId }: { eventId: string }) {
  useEffect(() => {
    localStorage.setItem("streetcat_event_id", eventId);
  }, [eventId]);
  return null;
}
