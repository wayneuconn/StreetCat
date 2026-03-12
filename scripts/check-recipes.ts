import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { asc } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function check() {
  const recipes = await db.query.recipes.findMany({
    orderBy: [asc(schema.recipes.name)],
    with: {
      recipeIngredients: {
        with: { ingredient: true },
      },
    },
  });

  for (const r of recipes) {
    console.log("---");
    console.log(`Recipe: ${r.name}`);
    console.log(`Instructions: ${r.instructions}`);
    console.log("Ingredients:");
    for (const ri of r.recipeIngredients) {
      console.log(`  ${ri.amount} ${ri.unit} ${ri.ingredient.name} (${ri.ingredient.category})`);
    }
    const hasGarnish = r.recipeIngredients.some(ri => ri.ingredient.category === "garnish");
    if (!hasGarnish) console.log("  ⚠️ NO GARNISH");
  }

  await pool.end();
}

check().catch(console.error);
