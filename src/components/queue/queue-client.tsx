"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOrderStream } from "@/hooks/use-order-stream";
import { updateOrderStatus } from "@/lib/actions/orders";
import { GlassIcon, UnitIcon, JiggerVisual, TechniqueIcon } from "@/components/icons/bar-icons";

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
            imageUrl?: string | null;
          };
        }[];
      };
    };
  }[];
};

// Detect technique keywords in instructions
function detectTechniques(instructions: string): string[] {
  const keywords: Record<string, string[]> = {
    shake: ["摇", "shake", "摇匀", "猛摇", "干摇"],
    stir: ["搅拌", "搅匀", "stir", "轻搅"],
    muddle: ["捣", "muddle", "轻捣"],
    strain: ["滤", "strain", "滤入"],
    flame: ["点火", "flame", "燃烧", "火焰"],
    build: ["倒入", "build", "加入"],
  };
  const found: string[] = [];
  const lower = instructions.toLowerCase();
  for (const [technique, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      found.push(technique);
    }
  }
  return found;
}

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
          <div className="card sticky top-32 space-y-5">
            <h3 className="font-heading text-lg text-accent-gold">
              {t("recipe")}
            </h3>
            {selectedOrder.items.map((item) => {
              const recipe = item.menuItem.recipe;
              const techniques = recipe.instructions
                ? detectTechniques(recipe.instructions)
                : [];

              return (
                <div key={item.id} className="space-y-3">
                  <h4 className="font-semibold text-text-primary text-lg">
                    {recipe.name}
                    {item.quantity > 1 && (
                      <span className="text-accent-gold ml-1">x{item.quantity}</span>
                    )}
                  </h4>

                  {/* Glass + Garnish row */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    {recipe.glassType && (
                      <div className="flex items-center gap-1.5">
                        <GlassIcon type={recipe.glassType} className="w-7 h-7 text-accent-gold" />
                        <span>{recipe.glassType}</span>
                      </div>
                    )}
                    {recipe.garnish && (
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">🍃</span>
                        <span>{recipe.garnish}</span>
                      </div>
                    )}
                  </div>

                  {/* Techniques */}
                  {techniques.length > 0 && (
                    <div className="flex items-center gap-3 text-text-muted">
                      {techniques.map((tech) => (
                        <div key={tech} className="flex items-center gap-1 text-xs">
                          <TechniqueIcon technique={tech} className="w-5 h-5 text-accent-gold/70" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ingredients with visual quantities */}
                  <div className="space-y-2">
                    {recipe.recipeIngredients.map((ri, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        {ri.ingredient.imageUrl ? (
                          <img
                            src={ri.ingredient.imageUrl}
                            alt={ri.ingredient.name}
                            className="w-6 h-6 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <UnitIcon unit={ri.unit} className="w-5 h-5 text-accent-gold/60 flex-shrink-0" />
                        )}
                        <span className="text-text-primary flex-1">
                          {ri.ingredient.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          {ri.unit === "oz" && (
                            <JiggerVisual amount={ri.amount} className="text-accent-gold/50" />
                          )}
                          <span className="font-mono text-xs">
                            {ri.amount} {ri.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  {recipe.instructions && (
                    <div className="text-xs text-text-muted whitespace-pre-line border-t border-border-gold/30 pt-2">
                      {recipe.instructions}
                    </div>
                  )}
                </div>
              );
            })}
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
