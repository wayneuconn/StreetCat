"use client";

import { useState, useEffect } from "react";

export function useOrderStatus(orderId: string, initialStatus: string) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  return status;
}
