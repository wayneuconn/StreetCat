"use client";

import { useOrderStatus } from "@/hooks/use-order-status";
import { useTranslations } from "next-intl";

const statusSteps = ["pending", "making", "ready", "picked_up"] as const;

export function OrderStatusCard({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const status = useOrderStatus(orderId, initialStatus);
  const t = useTranslations("order.status");

  const currentIndex = statusSteps.indexOf(
    status as (typeof statusSteps)[number]
  );

  return (
    <div className="card">
      <div className="flex justify-between">
        {statusSteps.map((step, i) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                i <= currentIndex
                  ? "bg-accent-gold text-bg-primary"
                  : "border border-border-gold-strong text-text-muted"
              }`}
            >
              {i < currentIndex ? "\u2713" : i + 1}
            </div>
            <span
              className={`mt-2 text-xs text-center ${
                i <= currentIndex ? "text-accent-gold" : "text-text-muted"
              }`}
            >
              {t(step)}
            </span>
            {i < statusSteps.length - 1 && (
              <div
                className={`absolute h-0.5 transition-all duration-500 ${
                  i < currentIndex ? "bg-accent-gold" : "bg-border-gold"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
