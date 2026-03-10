import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllRecipes() {
  return db.query.recipes.findMany({
    orderBy: [asc(recipes.name)],
  });
}

export async function getRecipe(id: string) {
  return db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeIngredients: {
        with: {
          ingredient: true,
        },
      },
    },
  });
}
