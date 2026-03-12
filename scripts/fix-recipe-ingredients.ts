/**
 * Fix missing ingredients in recipes.
 * Compares each recipe's instructions against its ingredient list
 * and adds any missing items.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

type Fix = {
  name: string; // ingredient name
  amount: number;
  unit: "oz" | "ml" | "dash" | "piece" | "bottle";
};

// Map recipe name -> missing ingredients to add
const FIXES: Record<string, Fix[]> = {
  "Cosmopolitan": [
    { name: "Cranberry Juice", amount: 1, unit: "oz" },
    { name: "Fresh Lime Juice", amount: 0.5, unit: "oz" },
    { name: "Lime Wheel", amount: 1, unit: "piece" },
  ],
  "Gran Torino 大都灵": [
    { name: "Cream", amount: 0.5, unit: "oz" },
    { name: "Cocoa Powder", amount: 1, unit: "piece" },
  ],
  "Manhattan": [
    { name: "Sweet Vermouth", amount: 1, unit: "oz" },
    { name: "Maraschino Cherry", amount: 1, unit: "piece" },
  ],
  "Martini": [
    { name: "Olive", amount: 1, unit: "piece" },
  ],
  "Mojito": [
    { name: "Fresh Lime Juice", amount: 1, unit: "oz" },
    { name: "Soda Water", amount: 2, unit: "oz" },
    { name: "Mint Sprig", amount: 1, unit: "piece" },
    { name: "Lime Wheel", amount: 1, unit: "piece" },
  ],
  "Negroni": [
    { name: "Sweet Vermouth", amount: 1, unit: "oz" },
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
  "Old Fashioned": [
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
  "Sixty Forty": [
    { name: "Maraschino Cherry", amount: 1, unit: "piece" },
    { name: "Olive", amount: 1, unit: "piece" },
  ],
  "Whiskey Sour": [
    { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" },
    { name: "Egg White", amount: 1, unit: "oz" },
    { name: "Maraschino Cherry", amount: 1, unit: "piece" },
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
  "暮色信差": [
    { name: "Cream Cap", amount: 1, unit: "oz" },
  ],
  "橙子海": [
    { name: "Orange Juice", amount: 2, unit: "oz" },
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
  "橙花 Orange Blossom No. 2": [
    { name: "Orange Juice", amount: 1, unit: "oz" },
    { name: "Fresh Lime Juice", amount: 0.5, unit: "oz" },
    { name: "Lime Wheel", amount: 1, unit: "piece" },
  ],
  "海王星 Neptune": [
    { name: "Coconut Milk", amount: 1, unit: "oz" },
    { name: "Coconut Water", amount: 1, unit: "oz" },
  ],
  "珊瑚海": [
    { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" },
    { name: "Yakult 养乐多", amount: 2, unit: "oz" },
    { name: "Mint Sprig", amount: 1, unit: "piece" },
  ],
  "笑场": [
    { name: "Orange Juice", amount: 1.5, unit: "oz" },
  ],
  "薰衣草骡子": [
    { name: "Fresh Lime Juice", amount: 0.75, unit: "oz" },
    { name: "Mint Sprig", amount: 1, unit: "piece" },
    { name: "Lime Wheel", amount: 1, unit: "piece" },
  ],
  "蜜瓜幻影 Midori Sour": [
    { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" },
    { name: "Egg White", amount: 1, unit: "oz" },
  ],
  "青见": [
    { name: "Tonic Water", amount: 3, unit: "oz" },
    { name: "Matcha Powder", amount: 0.5, unit: "oz" },
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
  "龙舌兰日出": [
    { name: "Orange Juice", amount: 3, unit: "oz" },
    { name: "Maraschino Cherry", amount: 1, unit: "piece" },
    { name: "Orange Peel", amount: 1, unit: "piece" },
  ],
};

async function fix() {
  console.log("Fixing recipe ingredients...\n");

  let totalAdded = 0;

  for (const [recipeName, fixes] of Object.entries(FIXES)) {
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.name, recipeName),
      with: { recipeIngredients: true },
    });

    if (!recipe) {
      console.log(`  ⚠️ Recipe not found: ${recipeName}`);
      continue;
    }

    // Get existing ingredient IDs for this recipe
    const existingIngIds = new Set(recipe.recipeIngredients.map(ri => ri.ingredientId));

    for (const fix of fixes) {
      const ingredient = await db.query.ingredients.findFirst({
        where: eq(schema.ingredients.name, fix.name),
      });

      if (!ingredient) {
        console.log(`  ⚠️ Ingredient not found: ${fix.name} (for ${recipeName})`);
        continue;
      }

      // Skip if already linked
      if (existingIngIds.has(ingredient.id)) {
        console.log(`  ⏭ ${recipeName}: already has ${fix.name}`);
        continue;
      }

      await db.insert(schema.recipeIngredients).values({
        recipeId: recipe.id,
        ingredientId: ingredient.id,
        amount: fix.amount,
        unit: fix.unit,
      });
      console.log(`  + ${recipeName}: added ${fix.amount} ${fix.unit} ${fix.name}`);
      totalAdded++;
    }
  }

  console.log(`\nDone: ${totalAdded} ingredient links added.`);
  await pool.end();
}

fix().catch(console.error);
