"use client";

import { useState } from "react";

type Order = {
  id: string;
  guestName: string;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

type Props = {
  orders: Order[];
  labels: {
    empty: string;
    guest: string;
    pending: string;
    making: string;
    ready: string;
    picked_up: string;
  };
};

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-pending",
  making: "badge-making",
  ready: "badge-ready",
  picked_up: "badge-picked_up",
};

export function OrderHistoryTable({ orders, labels }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (orders.length === 0) {
    return <p className="text-text-muted text-sm">{labels.empty}</p>;
  }

  const statusLabel = (s: string) =>
    labels[s as keyof typeof labels] || s;

  // Show first 10, expand to show all
  const displayOrders = expanded ? orders : orders.slice(0, 10);

  return (
    <div className="space-y-2">
      {displayOrders.map((order) => (
        <div
          key={order.id}
          className="flex items-center gap-3 py-2 border-b border-border-gold/50"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary font-medium">
                {order.guestName}
              </span>
              <span className={`badge text-[10px] ${STATUS_BADGE[order.status] || ""}`}>
                {statusLabel(order.status)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {order.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")}
            </p>
          </div>
          <span className="text-xs text-text-muted flex-shrink-0">
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}

      {!expanded && orders.length > 10 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-text-muted hover:text-accent-gold transition-colors"
        >
          +{orders.length - 10} more
        </button>
      )}
    </div>
  );
}
