"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recipes, recipeIngredients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (!value || value === "") return null;
  const n = parseFloat(value as string);
  return isNaN(n) ? null : n;
}

export async function createRecipe(formData: FormData) {
  const [recipe] = await db
    .insert(recipes)
    .values({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      instructions: formData.get("instructions") as string,
      glassType: formData.get("glassType") as
        | "rocks"
        | "coupe"
        | "highball"
        | "collins"
        | "flute"
        | "nick-nora",
      garnish: formData.get("garnish") as string,
      baseSpirit: (formData.get("baseSpirit") as string) || null,
      flavor: (formData.get("flavor") as string) || null,
      characteristics: (formData.get("characteristics") as string) || null,
      abv: parseOptionalFloat(formData.get("abv")),
      price: parseOptionalFloat(formData.get("price")),
      imageUrl: (formData.get("imageUrl") as string) || null,
    })
    .returning();

  revalidatePath("/admin/recipes");
  redirect(`/admin/recipes/${recipe.id}`);
}

export async function updateRecipe(formData: FormData) {
  const id = formData.get("id") as string;
  await db
    .update(recipes)
    .set({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      instructions: formData.get("instructions") as string,
      glassType: formData.get("glassType") as
        | "rocks"
        | "coupe"
        | "highball"
        | "collins"
        | "flute"
        | "nick-nora",
      garnish: formData.get("garnish") as string,
      baseSpirit: (formData.get("baseSpirit") as string) || null,
      flavor: (formData.get("flavor") as string) || null,
      characteristics: (formData.get("characteristics") as string) || null,
      abv: parseOptionalFloat(formData.get("abv")),
      price: parseOptionalFloat(formData.get("price")),
      imageUrl: (formData.get("imageUrl") as string) || null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id));
  revalidatePath(`/admin/recipes/${id}`);
  revalidatePath("/admin/recipes");
  revalidatePath("/menu");
}

export async function deleteRecipe(formData: FormData) {
  const id = formData.get("id") as string;
  await db.delete(recipes).where(eq(recipes.id, id));
  revalidatePath("/admin/recipes");
  redirect("/admin/recipes");
}

export async function addRecipeIngredient(formData: FormData) {
  const recipeId = formData.get("recipeId") as string;
  await db.insert(recipeIngredients).values({
    recipeId,
    ingredientId: formData.get("ingredientId") as string,
    amount: parseFloat(formData.get("amount") as string) || 0,
    unit: formData.get("unit") as "oz" | "ml" | "dash" | "piece" | "bottle",
  });
  revalidatePath(`/admin/recipes/${recipeId}`);
}

export async function removeRecipeIngredient(formData: FormData) {
  const id = formData.get("id") as string;
  const recipeId = formData.get("recipeId") as string;
  await db.delete(recipeIngredients).where(eq(recipeIngredients.id, id));
  revalidatePath(`/admin/recipes/${recipeId}`);
}
