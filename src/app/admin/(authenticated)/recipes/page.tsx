import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/queries/recipes";
import Link from "next/link";
import { deleteRecipe } from "@/lib/actions/recipes";

export default async function RecipesPage() {
  const t = await getTranslations("admin.recipes");
  const tc = await getTranslations("common");
  const recipeList = await getAllRecipes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("title")}
        </h1>
        <Link href="/admin/recipes/new" className="btn-primary text-sm">
          {t("addRecipe")}
        </Link>
      </div>

      {recipeList.length === 0 ? (
        <p className="text-text-muted text-center py-8">{tc("noResults")}</p>
      ) : (
        <div className="space-y-2">
          {recipeList.map((recipe) => (
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
                <form action={deleteRecipe}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-accent-burgundy transition-colors ml-4"
                  >
                    {tc("delete")}
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
