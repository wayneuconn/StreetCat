"use client";

import { useTranslations } from "next-intl";
import { deleteIngredient, updateIngredient } from "@/lib/actions/inventory";
import type { Ingredient } from "@/lib/db/schema";
import { useState } from "react";

export function IngredientTable({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const t = useTranslations("admin.inventory");
  const tc = useTranslations("common");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (ingredients.length === 0) {
    return <p className="text-text-muted text-center py-8">{t("title")}: 0</p>;
  }

  return (
    <div className="space-y-2">
      {ingredients.map((ing) => (
        <div key={ing.id} className="card">
          {editingId === ing.id ? (
            <form
              action={async (formData) => {
                await updateIngredient(formData);
                setEditingId(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={ing.id} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <input
                  name="name"
                  defaultValue={ing.name}
                  className="input col-span-2 sm:col-span-1"
                  required
                />
                <select
                  name="category"
                  defaultValue={ing.category}
                  className="input"
                >
                  <option value="spirit">{t("categories.spirit")}</option>
                  <option value="mixer">{t("categories.mixer")}</option>
                  <option value="garnish">{t("categories.garnish")}</option>
                  <option value="bitter">{t("categories.bitter")}</option>
                  <option value="other">{t("categories.other")}</option>
                </select>
                <input
                  name="quantityOnHand"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={ing.quantityOnHand}
                  className="input"
                />
                <select
                  name="unit"
                  defaultValue={ing.unit}
                  className="input"
                >
                  <option value="oz">oz</option>
                  <option value="ml">ml</option>
                  <option value="dash">dash</option>
                  <option value="piece">piece</option>
                  <option value="bottle">bottle</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  {tc("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="btn-secondary text-sm"
                >
                  {tc("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text-primary">
                  {ing.name}
                </span>
                <span className="ml-2 text-xs badge badge-pending">
                  {t(`categories.${ing.category}`)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">
                  {ing.quantityOnHand} {ing.unit}
                </span>
                <button
                  onClick={() => setEditingId(ing.id)}
                  className="text-xs text-text-muted hover:text-accent-gold transition-colors"
                >
                  {tc("edit")}
                </button>
                <form action={deleteIngredient}>
                  <input type="hidden" name="id" value={ing.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
                  >
                    {tc("delete")}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
