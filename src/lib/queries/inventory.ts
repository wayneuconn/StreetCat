import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllIngredients() {
  return db.query.ingredients.findMany({
    orderBy: [asc(ingredients.category), asc(ingredients.name)],
  });
}

export async function getIngredient(id: string) {
  return db.query.ingredients.findFirst({
    where: eq(ingredients.id, id),
  });
}
