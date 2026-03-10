"use client";

import { useTranslations } from "next-intl";
import { createIngredient } from "@/lib/actions/inventory";
import { useRef } from "react";

export function IngredientForm() {
  const t = useTranslations("admin.inventory");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createIngredient(formData);
        formRef.current?.reset();
      }}
      className="card space-y-3"
    >
      <h3 className="text-sm font-semibold text-text-secondary">
        {t("addIngredient")}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input
          name="name"
          required
          placeholder={t("name")}
          className="input col-span-2 sm:col-span-1"
        />
        <select name="category" className="input" defaultValue="other">
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
          defaultValue="0"
          placeholder={t("quantity")}
          className="input"
        />
        <select name="unit" className="input" defaultValue="oz">
          <option value="oz">oz</option>
          <option value="ml">ml</option>
          <option value="dash">dash</option>
          <option value="piece">piece</option>
          <option value="bottle">bottle</option>
        </select>
      </div>
      <button type="submit" className="btn-primary text-sm">
        {t("addIngredient")}
      </button>
    </form>
  );
}
