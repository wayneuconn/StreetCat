import { getTranslations } from "next-intl/server";
import { getAllIngredients } from "@/lib/queries/inventory";
import { IngredientTable } from "@/components/inventory/ingredient-table";
import { IngredientForm } from "@/components/inventory/ingredient-form";

export default async function InventoryPage() {
  const t = await getTranslations("admin.inventory");
  const ingredientsList = await getAllIngredients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("title")}
        </h1>
      </div>
      <IngredientForm />
      <IngredientTable ingredients={ingredientsList} />
    </div>
  );
}
