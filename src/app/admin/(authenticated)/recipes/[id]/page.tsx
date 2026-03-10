import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getRecipe, getDistinctFlavors } from "@/lib/queries/recipes";
import { getAllIngredients } from "@/lib/queries/inventory";
import {
  addRecipeIngredient,
  removeRecipeIngredient,
} from "@/lib/actions/recipes";
import { RecipeEditor } from "@/components/recipe/recipe-editor";
import Link from "next/link";

const CATEGORY_ORDER = ["spirit", "liqueur", "juice", "mixer", "garnish", "bitter", "other"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  spirit: "基酒", liqueur: "利口酒", juice: "果汁", mixer: "调配料",
  garnish: "装饰", bitter: "苦精", other: "其他",
};

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

  const [allIngredients, existingFlavors] = await Promise.all([
    getAllIngredients(),
    getDistinctFlavors(),
  ]);

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

      <RecipeEditor recipe={recipe} existingFlavors={existingFlavors} />

      {/* Ingredients by category - each category is its own card */}
      {CATEGORY_ORDER
        .filter((cat) =>
          allIngredients.some((ing) => ing.category === cat)
        )
        .map((cat) => {
          const catIngredients = recipe.recipeIngredients.filter(
            (ri) => ri.ingredient.category === cat
          );
          const availableForAdd = allIngredients.filter(
            (ing) => ing.category === cat
          );

          return (
            <div key={cat} className="card space-y-3">
              <h3 className="text-sm font-semibold text-accent-gold/80 uppercase tracking-wider">
                {CATEGORY_LABELS[cat]}
              </h3>

              {catIngredients.length > 0 && (
                <div className="space-y-1">
                  {catIngredients.map((ri) => (
                    <div
                      key={ri.id}
                      className="flex items-center justify-between py-1.5 border-b border-border-gold/30"
                    >
                      <span className="text-text-primary text-sm">
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

              {availableForAdd.length > 0 && (
                <form
                  action={addRecipeIngredient}
                  className="flex flex-wrap gap-2 items-end pt-1"
                >
                  <input type="hidden" name="recipeId" value={recipe.id} />
                  <div className="flex-1 min-w-[120px]">
                    <select name="ingredientId" required className="input text-sm">
                      <option value="">+ {CATEGORY_LABELS[cat]}</option>
                      {availableForAdd.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-18">
                    <input
                      name="amount"
                      type="number"
                      step="0.25"
                      min="0"
                      required
                      placeholder={t("amount")}
                      className="input text-sm"
                    />
                  </div>
                  <div className="w-20">
                    <select name="unit" className="input text-sm" defaultValue={cat === "garnish" ? "piece" : cat === "bitter" ? "dash" : "oz"}>
                      <option value="oz">oz</option>
                      <option value="ml">ml</option>
                      <option value="dash">dash</option>
                      <option value="piece">piece</option>
                      <option value="bottle">bottle</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                    {tc("add")}
                  </button>
                </form>
              )}
            </div>
          );
        })}
    </div>
  );
}
