"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOrderStream } from "@/hooks/use-order-stream";
import { updateOrderStatus } from "@/lib/actions/orders";

type OrderWithItems = {
  id: string;
  guestName: string;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    menuItem: {
      recipe: {
        name: string;
        instructions: string | null;
        glassType: string | null;
        garnish: string | null;
        recipeIngredients: {
          amount: number;
          unit: string;
          ingredient: {
            name: string;
          };
        }[];
      };
    };
  }[];
};

const nextStatus: Record<string, string> = {
  pending: "making",
  making: "ready",
  ready: "picked_up",
};

const statusAction: Record<string, string> = {
  pending: "markMaking",
  making: "markReady",
  ready: "markPickedUp",
};

export function QueueClient({
  eventId,
  initialOrders,
}: {
  eventId: string;
  initialOrders: OrderWithItems[];
}) {
  const t = useTranslations("admin.queue");
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useOrderStream(() => {
    router.refresh();
  });

  const selectedOrder = initialOrders.find((o) => o.id === selectedOrderId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        {initialOrders.length === 0 ? (
          <p className="text-text-muted text-center py-8">{t("empty")}</p>
        ) : (
          initialOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`card cursor-pointer transition-all ${
                selectedOrderId === order.id
                  ? "border-accent-gold"
                  : "card-hover"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {order.guestName}
                    </span>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {order.items.map((item) => (
                      <span key={item.id} className="mr-3">
                        {item.menuItem.recipe.name}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {nextStatus[order.status] && (
                  <form action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={nextStatus[order.status]}
                    />
                    <button
                      type="submit"
                      className="btn-primary text-xs whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t(statusAction[order.status] as "markMaking")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recipe sidebar */}
      <div className="hidden lg:block">
        {selectedOrder ? (
          <div className="card sticky top-32 space-y-4">
            <h3 className="font-heading text-lg text-accent-gold">
              {t("recipe")}
            </h3>
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <h4 className="font-semibold text-text-primary">
                  {item.menuItem.recipe.name}
                </h4>
                {item.menuItem.recipe.glassType && (
                  <p className="text-xs text-text-muted">
                    Glass: {item.menuItem.recipe.glassType}
                  </p>
                )}
                {item.menuItem.recipe.garnish && (
                  <p className="text-xs text-text-muted">
                    Garnish: {item.menuItem.recipe.garnish}
                  </p>
                )}
                <ul className="text-sm space-y-1">
                  {item.menuItem.recipe.recipeIngredients.map((ri, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-text-secondary"
                    >
                      <span>{ri.ingredient.name}</span>
                      <span>
                        {ri.amount} {ri.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                {item.menuItem.recipe.instructions && (
                  <p className="text-xs text-text-muted whitespace-pre-line mt-2">
                    {item.menuItem.recipe.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center text-text-muted py-8">
            Select an order to see recipe details
          </div>
        )}
      </div>
    </div>
  );
}
