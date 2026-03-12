import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function getAllRecipes() {
  return db.query.recipes.findMany({
    orderBy: [asc(recipes.name)],
    with: {
      recipeIngredients: {
        with: { ingredient: true },
      },
    },
  });
}

export async function getDistinctFlavors(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ flavor: recipes.flavor })
    .from(recipes)
    .where(sql`${recipes.flavor} IS NOT NULL AND ${recipes.flavor} != ''`)
    .orderBy(asc(recipes.flavor));
  return rows.map((r) => r.flavor!);
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
