import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/queries/recipes";
import Link from "next/link";
import { deleteRecipe } from "@/lib/actions/recipes";
import { RecipeFilterList } from "@/components/recipe/recipe-filter-list";

export default async function RecipesPage() {
  const t = await getTranslations("admin.recipes");
  const tc = await getTranslations("common");
  const ti = await getTranslations("admin.inventory.categories");
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
        categoryLabels={{
          spirit: ti("spirit"),
          liqueur: ti("liqueur"),
          juice: ti("juice"),
          mixer: ti("mixer"),
          bitter: ti("bitter"),
          garnish: ti("garnish"),
          other: ti("other"),
        }}
        labels={{
          delete: tc("delete"),
          noResults: tc("noResults"),
          filterCount: t("filterCount"),
          clearFilter: t("clearFilter"),
          allOption: tc("noResults"),
        }}
        deleteAction={deleteRecipe}
      />
    </div>
  );
}
