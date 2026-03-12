"use client";

import { useState } from "react";

type ShoppingItem = {
  ingredientId: string;
  ingredientName: string;
  category: string;
  needed: number;
  onHand: number;
  toBuy: number;
  unit: string;
};

type Props = {
  items: ShoppingItem[];
  labels: {
    item: string;
    needed: string;
    onHand: string;
    toBuy: string;
    empty: string;
    showAll: string;
    showToBuy: string;
  };
};

export function ShoppingListTable({ items, labels }: Props) {
  const [showAll, setShowAll] = useState(false);

  const needToBuy = items.filter((i) => i.toBuy > 0);
  const displayItems = showAll ? items : needToBuy;

  return (
    <div className="space-y-3">
      {items.length > needToBuy.length && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-text-muted hover:text-accent-gold transition-colors"
        >
          {showAll ? labels.showToBuy : labels.showAll}
          {!showAll && (
            <span className="ml-1 text-text-muted/60">
              (+{items.length - needToBuy.length})
            </span>
          )}
        </button>
      )}

      {displayItems.length === 0 ? (
        <p className="text-text-muted text-sm">{labels.empty}</p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider pb-2 border-b border-border-gold">
            <span>{labels.item}</span>
            <span className="text-right">{labels.needed}</span>
            <span className="text-right">{labels.onHand}</span>
            <span className="text-right">{labels.toBuy}</span>
          </div>
          {displayItems.map((item) => (
            <div
              key={item.ingredientId}
              className={`grid grid-cols-4 gap-2 text-sm py-1 border-b border-border-gold/50 ${
                item.toBuy === 0 ? "opacity-40" : ""
              }`}
            >
              <span className="text-text-primary">{item.ingredientName}</span>
              <span className="text-right text-text-secondary">
                {item.needed.toFixed(1)} {item.unit}
              </span>
              <span className="text-right text-text-secondary">
                {item.onHand.toFixed(1)}
              </span>
              <span
                className={`text-right font-semibold ${
                  item.toBuy > 0
                    ? "text-accent-gold"
                    : "text-text-muted"
                }`}
              >
                {item.toBuy > 0 ? item.toBuy.toFixed(1) : "✓"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
