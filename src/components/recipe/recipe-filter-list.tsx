"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  glassType: string | null;
  recipeIngredients: {
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
  }[];
};

type Props = {
  recipes: Recipe[];
  labels: {
    addRecipe: string;
    delete: string;
    noResults: string;
    filterPlaceholder: string;
    filterCount: string;
    clearFilter: string;
  };
  deleteAction: (formData: FormData) => Promise<void>;
};

export function RecipeFilterList({ recipes, labels, deleteAction }: Props) {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Build unique ingredient list grouped by category
  const ingredientsByCategory = useMemo(() => {
    const map = new Map<string, Map<string, string>>(); // category -> (id -> name)
    for (const r of recipes) {
      for (const ri of r.recipeIngredients) {
        const cat = ri.ingredient.category;
        if (!map.has(cat)) map.set(cat, new Map());
        map.get(cat)!.set(ri.ingredient.id, ri.ingredient.name);
      }
    }
    return map;
  }, [recipes]);

  // All unique ingredients for search
  const allIngredients = useMemo(() => {
    const list: { id: string; name: string; category: string }[] = [];
    for (const [cat, items] of ingredientsByCategory) {
      for (const [id, name] of items) {
        list.push({ id, name, category: cat });
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredientsByCategory]);

  const filteredIngredients = searchTerm
    ? allIngredients.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    if (selectedIngredients.size === 0) return recipes;
    return recipes.filter((r) => {
      const recipeIngIds = new Set(
        r.recipeIngredients.map((ri) => ri.ingredient.id)
      );
      return [...selectedIngredients].every((id) => recipeIngIds.has(id));
    });
  }, [recipes, selectedIngredients]);

  const toggleIngredient = (id: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIngredientName = (id: string) =>
    allIngredients.find((i) => i.id === id)?.name || id;

  return (
    <div className="space-y-4">
      {/* Ingredient filter */}
      <div className="card space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={labels.filterPlaceholder}
            className="input w-full text-sm"
          />
          {searchTerm && filteredIngredients.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card border border-border-gold rounded-lg max-h-48 overflow-y-auto shadow-lg">
              {filteredIngredients.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => {
                    toggleIngredient(ing.id);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-bg-secondary transition-colors ${
                    selectedIngredients.has(ing.id)
                      ? "text-accent-gold"
                      : "text-text-primary"
                  }`}
                >
                  {ing.name}
                  <span className="text-text-muted text-xs ml-2">
                    {ing.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected tags */}
        {selectedIngredients.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {[...selectedIngredients].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleIngredient(id)}
                className="badge badge-making text-xs flex items-center gap-1"
              >
                {getIngredientName(id)}
                <span className="opacity-60">×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedIngredients(new Set())}
              className="text-xs text-text-muted hover:text-accent-gold transition-colors"
            >
              {labels.clearFilter}
            </button>
          </div>
        )}

        {selectedIngredients.size > 0 && (
          <p className="text-xs text-text-muted">
            {labels.filterCount.replace(
              "{count}",
              String(filteredRecipes.length)
            )}
          </p>
        )}
      </div>

      {/* Recipe list */}
      {filteredRecipes.length === 0 ? (
        <p className="text-text-muted text-center py-8">{labels.noResults}</p>
      ) : (
        <div className="space-y-2">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="card card-hover">
              <div className="flex items-center justify-between">
                <Link
                  href={`/admin/recipes/${recipe.id}`}
                  className="flex-1"
                >
                  <h3 className="font-heading text-lg text-accent-gold hover:text-accent-gold-light transition-colors">
                    {recipe.name}
                  </h3>
                  {recipe.description && (
                    <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1 text-xs text-text-muted">
                    {recipe.glassType && <span>{recipe.glassType}</span>}
                  </div>
                </Link>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-accent-burgundy transition-colors ml-4"
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
