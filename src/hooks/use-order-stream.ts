"use client";

import { useEffect, useCallback, useRef } from "react";
import type { OrderEvent } from "@/lib/events";

export function useOrderStream(onEvent: (event: OrderEvent) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const eventSource = new EventSource("/api/orders/stream");

    eventSource.onmessage = (e) => {
      try {
        const event: OrderEvent = JSON.parse(e.data);
        onEventRef.current(event);
      } catch {
        // Ignore parse errors (heartbeats, etc.)
      }
    };

    eventSource.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => eventSource.close();
  }, []);
}
