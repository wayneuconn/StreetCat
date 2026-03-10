"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createIngredient(formData: FormData) {
  await db.insert(ingredients).values({
    name: formData.get("name") as string,
    category: formData.get("category") as "spirit" | "mixer" | "garnish" | "bitter" | "other",
    quantityOnHand: parseFloat(formData.get("quantityOnHand") as string) || 0,
    unit: formData.get("unit") as "oz" | "ml" | "dash" | "piece" | "bottle",
  });
  revalidatePath("/admin/inventory");
}

export async function updateIngredient(formData: FormData) {
  const id = formData.get("id") as string;
  await db
    .update(ingredients)
    .set({
      name: formData.get("name") as string,
      category: formData.get("category") as "spirit" | "mixer" | "garnish" | "bitter" | "other",
      quantityOnHand: parseFloat(formData.get("quantityOnHand") as string) || 0,
      unit: formData.get("unit") as "oz" | "ml" | "dash" | "piece" | "bottle",
      updatedAt: new Date(),
    })
    .where(eq(ingredients.id, id));
  revalidatePath("/admin/inventory");
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get("id") as string;
  await db.delete(ingredients).where(eq(ingredients.id, id));
  revalidatePath("/admin/inventory");
}
