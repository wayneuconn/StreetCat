"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  glassType: string | null;
  recipeIngredients: {
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
  }[];
};

const CATEGORY_ORDER = ["spirit", "liqueur", "juice", "mixer", "bitter", "garnish", "other"] as const;

type Props = {
  recipes: Recipe[];
  categoryLabels: Record<string, string>;
  labels: {
    delete: string;
    noResults: string;
    filterCount: string;
    clearFilter: string;
    allOption: string;
  };
  deleteAction: (formData: FormData) => Promise<void>;
};

export function RecipeFilterList({ recipes, categoryLabels, labels, deleteAction }: Props) {
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string>>({});

  // Build unique ingredient list grouped by category (only categories actually used)
  const ingredientsByCategory = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    const seen = new Set<string>();
    for (const r of recipes) {
      for (const ri of r.recipeIngredients) {
        if (seen.has(ri.ingredient.id)) continue;
        seen.add(ri.ingredient.id);
        const cat = ri.ingredient.category;
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push({ id: ri.ingredient.id, name: ri.ingredient.name });
      }
    }
    // Sort ingredients within each category
    for (const [, items] of map) {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [recipes]);

  // Ordered categories that actually have ingredients
  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => ingredientsByCategory.has(c)),
    [ingredientsByCategory]
  );

  // Collect all selected ingredient IDs
  const selectedIngredientIds = useMemo(() => {
    return Object.values(selectedByCategory).filter(Boolean);
  }, [selectedByCategory]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    if (selectedIngredientIds.length === 0) return recipes;
    return recipes.filter((r) => {
      const recipeIngIds = new Set(r.recipeIngredients.map((ri) => ri.ingredient.id));
      return selectedIngredientIds.every((id) => recipeIngIds.has(id));
    });
  }, [recipes, selectedIngredientIds]);

  const handleSelect = (category: string, ingredientId: string) => {
    setSelectedByCategory((prev) => {
      const next = { ...prev };
      if (ingredientId === "") {
        delete next[category];
      } else {
        next[category] = ingredientId;
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Category dropdowns */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <select
              key={cat}
              value={selectedByCategory[cat] || ""}
              onChange={(e) => handleSelect(cat, e.target.value)}
              className={`input text-sm ${selectedByCategory[cat] ? "border-accent-gold" : ""}`}
            >
              <option value="">{categoryLabels[cat] || cat}</option>
              {ingredientsByCategory.get(cat)!.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
          ))}
        </div>

        {selectedIngredientIds.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {labels.filterCount.replace("{count}", String(filteredRecipes.length))}
            </p>
            <button
              type="button"
              onClick={() => setSelectedByCategory({})}
              className="text-xs text-text-muted hover:text-accent-gold transition-colors"
            >
              {labels.clearFilter}
            </button>
          </div>
        )}
      </div>

      {/* Recipe list */}
      {filteredRecipes.length === 0 ? (
        <p className="text-text-muted text-center py-8">{labels.noResults}</p>
      ) : (
        <div className="space-y-2">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="card card-hover">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <Link
                  href={`/admin/recipes/${recipe.id}`}
                  className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-border-gold/10 flex items-center justify-center">
                      <span className="text-xl text-text-muted/30">🍸</span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <Link href={`/admin/recipes/${recipe.id}`} className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg text-accent-gold hover:text-accent-gold-light transition-colors">
                    {recipe.name}
                  </h3>
                  {recipe.description && (
                    <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">
                      {recipe.description}
                    </p>
                  )}
                </Link>

                {/* Delete */}
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-accent-burgundy transition-colors ml-2"
                  >
                    {labels.delete}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
