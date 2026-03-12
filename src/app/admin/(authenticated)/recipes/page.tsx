import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/queries/recipes";
import Link from "next/link";
import { deleteRecipe } from "@/lib/actions/recipes";
import { RecipeFilterList } from "@/components/recipe/recipe-filter-list";

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

      <RecipeFilterList
        recipes={recipeList}
        labels={{
          addRecipe: t("addRecipe"),
          delete: tc("delete"),
          noResults: tc("noResults"),
          filterPlaceholder: t("filterByIngredient"),
          filterCount: t("filterCount"),
          clearFilter: t("clearFilter"),
        }}
        deleteAction={deleteRecipe}
      />
    </div>
  );
}
