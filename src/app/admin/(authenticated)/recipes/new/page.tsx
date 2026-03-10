import { getTranslations } from "next-intl/server";
import { createRecipe } from "@/lib/actions/recipes";

export default async function NewRecipePage() {
  const t = await getTranslations("admin.recipes");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-accent-gold">
        {t("addRecipe")}
      </h1>
      <form action={createRecipe} className="card space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("name")}
          </label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("description")}
          </label>
          <textarea name="description" rows={3} className="input" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("instructions")}
          </label>
          <textarea name="instructions" rows={4} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("glassType")}
            </label>
            <select name="glassType" className="input" defaultValue="rocks">
              <option value="rocks">Rocks</option>
              <option value="coupe">Coupe</option>
              <option value="highball">Highball</option>
              <option value="collins">Collins</option>
              <option value="flute">Flute</option>
              <option value="nick-nora">Nick & Nora</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("garnish")}
            </label>
            <input name="garnish" className="input" />
          </div>
        </div>
        <button type="submit" className="btn-primary">
          {t("addRecipe")}
        </button>
      </form>
    </div>
  );
}
