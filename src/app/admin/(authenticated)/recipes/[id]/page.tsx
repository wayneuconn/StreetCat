import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getRecipe } from "@/lib/queries/recipes";
import { getAllIngredients } from "@/lib/queries/inventory";
import {
  addRecipeIngredient,
  removeRecipeIngredient,
} from "@/lib/actions/recipes";
import { RecipeEditor } from "@/components/recipe/recipe-editor";
import Link from "next/link";

export default async function RecipeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.recipes");
  const tc = await getTranslations("common");

  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const allIngredients = await getAllIngredients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("editRecipe")}
        </h1>
        <Link
          href="/admin/recipes"
          className="text-sm text-text-muted hover:text-accent-gold transition-colors"
        >
          {tc("back")}
        </Link>
      </div>

      <RecipeEditor recipe={recipe} />

      {/* Ingredients */}
      <div className="card space-y-4">
        <h3 className="font-heading text-lg text-accent-gold">
          {t("ingredients")}
        </h3>

        {recipe.recipeIngredients.length > 0 && (
          <div className="space-y-2">
            {recipe.recipeIngredients.map((ri) => (
              <div
                key={ri.id}
                className="flex items-center justify-between py-2 border-b border-border-gold"
              >
                <span className="text-text-primary">
                  {ri.ingredient.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">
                    {ri.amount} {ri.unit}
                  </span>
                  <form action={removeRecipeIngredient}>
                    <input type="hidden" name="id" value={ri.id} />
                    <input type="hidden" name="recipeId" value={recipe.id} />
                    <button
                      type="submit"
                      className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
                    >
                      {tc("delete")}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          action={addRecipeIngredient}
          className="flex flex-wrap gap-3 items-end pt-2"
        >
          <input type="hidden" name="recipeId" value={recipe.id} />
          <div className="flex-1 min-w-[140px]">
            <select name="ingredientId" required className="input">
              <option value="">{t("addIngredient")}</option>
              {allIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <input
              name="amount"
              type="number"
              step="0.25"
              min="0"
              required
              placeholder={t("amount")}
              className="input"
            />
          </div>
          <div className="w-24">
            <select name="unit" className="input" defaultValue="oz">
              <option value="oz">oz</option>
              <option value="ml">ml</option>
              <option value="dash">dash</option>
              <option value="piece">piece</option>
              <option value="bottle">bottle</option>
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm">
            {tc("add")}
          </button>
        </form>
      </div>
    </div>
  );
}
