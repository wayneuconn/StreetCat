/**
 * CLI script to add a recipe and its ingredients to the database.
 * Usage: npx tsx scripts/add-recipe.ts '<JSON>'
 *
 * JSON format:
 * {
 *   "name": "Mojito",
 *   "description": "朗姆酒配薄荷青柠苏打",
 *   "instructions": "杯中放入薄荷叶...",
 *   "glassType": "highball",
 *   "flavor": "晒太阳☀️",
 *   "characteristics": "清爽、微甜",
 *   "abv": 2,
 *   "price": null,
 *   "ingredients": [
 *     { "name": "White Rum", "amount": 2, "unit": "oz", "category": "spirit" },
 *     { "name": "Fresh Lime Juice", "amount": 1, "unit": "oz", "category": "juice" }
 *   ]
 * }
 *
 * - If an ingredient doesn't exist in the DB, it will be created with quantity 0
 * - glassType: rocks | coupe | highball | collins | flute | nick-nora
 * - unit: oz | ml | dash | piece | bottle
 * - category: spirit | liqueur | juice | mixer | garnish | bitter | other
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

interface RecipeInput {
  name: string;
  description?: string;
  instructions?: string;
  glassType?: string;
  flavor?: string;
  characteristics?: string;
  abv?: number;
  price?: number;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    category?: string;
  }[];
}

async function addRecipe(input: RecipeInput) {
  console.log(`\nAdding recipe: ${input.name}\n`);

  // 1. Ensure all ingredients exist
  for (const ing of input.ingredients) {
    const existing = await db.query.ingredients.findFirst({
      where: eq(schema.ingredients.name, ing.name),
    });

    if (!existing) {
      const category = (ing.category || "other") as "spirit" | "liqueur" | "juice" | "mixer" | "garnish" | "bitter" | "other";
      const unit = (ing.unit || "oz") as "oz" | "ml" | "dash" | "piece" | "bottle";
      const [created] = await db
        .insert(schema.ingredients)
        .values({ name: ing.name, category, unit, quantityOnHand: 0 })
        .returning();
      console.log(`  Created ingredient: ${ing.name} (${category}, ${unit}) — qty: 0`);
    } else {
      console.log(`  Found ingredient: ${ing.name} — qty: ${existing.quantityOnHand} ${existing.unit}`);
    }
  }

  // 2. Check if recipe already exists
  const existingRecipe = await db.query.recipes.findFirst({
    where: eq(schema.recipes.name, input.name),
  });

  if (existingRecipe) {
    console.log(`\n  Recipe "${input.name}" already exists (id: ${existingRecipe.id}). Updating...`);
    await db
      .update(schema.recipes)
      .set({
        description: input.description || existingRecipe.description,
        instructions: input.instructions || existingRecipe.instructions,
        glassType: (input.glassType as any) || existingRecipe.glassType,
        flavor: input.flavor || existingRecipe.flavor,
        characteristics: input.characteristics || existingRecipe.characteristics,
        abv: input.abv ?? existingRecipe.abv,
        price: input.price ?? existingRecipe.price,
        updatedAt: new Date(),
      })
      .where(eq(schema.recipes.id, existingRecipe.id));

    // Clear old ingredients and re-add
    await db.delete(schema.recipeIngredients).where(eq(schema.recipeIngredients.recipeId, existingRecipe.id));
    await addRecipeIngredients(existingRecipe.id, input.ingredients);
    console.log(`\n  Updated recipe: ${input.name}`);
  } else {
    // 3. Create recipe
    const [recipe] = await db
      .insert(schema.recipes)
      .values({
        name: input.name,
        description: input.description || null,
        instructions: input.instructions || null,
        glassType: (input.glassType as any) || "rocks",
        flavor: input.flavor || null,
        characteristics: input.characteristics || null,
        abv: input.abv ?? null,
        price: input.price ?? null,
      })
      .returning();

    await addRecipeIngredients(recipe.id, input.ingredients);
    console.log(`\n  Created recipe: ${input.name} (id: ${recipe.id})`);
  }

  console.log("\nDone!");
  await pool.end();
}

async function addRecipeIngredients(
  recipeId: string,
  ingredients: RecipeInput["ingredients"]
) {
  for (const ing of ingredients) {
    const ingredient = await db.query.ingredients.findFirst({
      where: eq(schema.ingredients.name, ing.name),
    });
    if (!ingredient) continue;

    await db.insert(schema.recipeIngredients).values({
      recipeId,
      ingredientId: ingredient.id,
      amount: ing.amount,
      unit: (ing.unit || "oz") as "oz" | "ml" | "dash" | "piece" | "bottle",
    });
    console.log(`  Added: ${ing.amount} ${ing.unit} ${ing.name}`);
  }
}

// Parse CLI argument
const jsonArg = process.argv[2];
if (!jsonArg) {
  console.error("Usage: npx tsx scripts/add-recipe.ts '<JSON>'");
  process.exit(1);
}

try {
  const input: RecipeInput = JSON.parse(jsonArg);
  addRecipe(input).catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
} catch {
  console.error("Invalid JSON input");
  process.exit(1);
}
