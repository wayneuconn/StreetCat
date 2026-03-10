import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...\n");

  // Ingredients
  const spirits = [
    { name: "Bourbon", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Rye Whiskey", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "London Dry Gin", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Vodka", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "White Rum", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Dark Rum", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Tequila Blanco", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Mezcal", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Cognac", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Campari", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Sweet Vermouth", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Dry Vermouth", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Triple Sec", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Cointreau", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 8 },
    { name: "Aperol", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
  ];

  const mixers = [
    { name: "Simple Syrup", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Fresh Lime Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Fresh Lemon Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Soda Water", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 64 },
    { name: "Tonic Water", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 48 },
    { name: "Ginger Beer", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Cranberry Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Egg White", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 8 },
    { name: "Prosecco", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 24 },
  ];

  const bitters = [
    { name: "Angostura Bitters", category: "bitter" as const, unit: "dash" as const, quantityOnHand: 50 },
    { name: "Orange Bitters", category: "bitter" as const, unit: "dash" as const, quantityOnHand: 30 },
    { name: "Peychaud's Bitters", category: "bitter" as const, unit: "dash" as const, quantityOnHand: 30 },
  ];

  const garnishes = [
    { name: "Orange Peel", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Lemon Peel", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Lime Wheel", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Maraschino Cherry", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 30 },
    { name: "Mint Sprig", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Olive", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
  ];

  const allIngredients = [...spirits, ...mixers, ...bitters, ...garnishes];
  const inserted = await db
    .insert(schema.ingredients)
    .values(allIngredients)
    .returning();

  const byName = new Map(inserted.map((i) => [i.name, i]));
  console.log(`Inserted ${inserted.length} ingredients`);

  // Helper to get ingredient ID
  const id = (name: string) => byName.get(name)!.id;

  // Recipes
  const recipesData = [
    {
      name: "Old Fashioned",
      description:
        "The quintessential whiskey cocktail. Smooth, spirit-forward, with just a touch of sweetness.",
      instructions:
        "Add sugar, bitters, and a splash of water to a rocks glass. Muddle until dissolved. Add a large ice cube and bourbon. Stir gently. Express orange peel over the glass and drop in.",
      glassType: "rocks" as const,
      garnish: "Orange peel, cherry",
      ingredients: [
        { name: "Bourbon", amount: 2, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.25, unit: "oz" as const },
        { name: "Angostura Bitters", amount: 3, unit: "dash" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Negroni",
      description:
        "Bitter, sweet, and strong. The perfect aperitivo cocktail from Italy.",
      instructions:
        "Add all ingredients to a mixing glass with ice. Stir for 30 seconds until well chilled. Strain into a rocks glass over a large ice cube. Garnish with orange peel.",
      glassType: "rocks" as const,
      garnish: "Orange peel",
      ingredients: [
        { name: "London Dry Gin", amount: 1, unit: "oz" as const },
        { name: "Campari", amount: 1, unit: "oz" as const },
        { name: "Sweet Vermouth", amount: 1, unit: "oz" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Margarita",
      description: "The classic tequila sour. Fresh, bright, and perfectly balanced.",
      instructions:
        "Combine tequila, Cointreau, and lime juice in a shaker with ice. Shake vigorously for 15 seconds. Strain into a coupe or over fresh ice in a rocks glass. Salt rim optional.",
      glassType: "coupe" as const,
      garnish: "Lime wheel, salt rim",
      ingredients: [
        { name: "Tequila Blanco", amount: 2, unit: "oz" as const },
        { name: "Cointreau", amount: 0.75, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 1, unit: "oz" as const },
      ],
    },
    {
      name: "Whiskey Sour",
      description: "A perfectly balanced cocktail that showcases bourbon's warmth with bright citrus.",
      instructions:
        "Add bourbon, lemon juice, simple syrup, and egg white to a shaker. Dry shake (no ice) for 10 seconds. Add ice and shake hard for 15 seconds. Strain into a coupe glass. Dash bitters on top.",
      glassType: "coupe" as const,
      garnish: "Angostura bitters design on foam",
      ingredients: [
        { name: "Bourbon", amount: 2, unit: "oz" as const },
        { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.75, unit: "oz" as const },
        { name: "Egg White", amount: 1, unit: "oz" as const },
        { name: "Angostura Bitters", amount: 2, unit: "dash" as const },
      ],
    },
    {
      name: "Daiquiri",
      description: "The template for all sour cocktails. Deceptively simple, endlessly satisfying.",
      instructions:
        "Combine all ingredients in a shaker with ice. Shake vigorously for 15 seconds. Fine strain into a chilled coupe glass.",
      glassType: "coupe" as const,
      garnish: "Lime wheel",
      ingredients: [
        { name: "White Rum", amount: 2, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 1, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.75, unit: "oz" as const },
      ],
    },
    {
      name: "Gin & Tonic",
      description: "Crisp, refreshing, and effortlessly elegant. A timeless highball.",
      instructions:
        "Fill a highball glass with ice. Pour gin over ice, top with tonic water. Gently stir once. Garnish with lime.",
      glassType: "highball" as const,
      garnish: "Lime wheel",
      ingredients: [
        { name: "London Dry Gin", amount: 2, unit: "oz" as const },
        { name: "Tonic Water", amount: 4, unit: "oz" as const },
        { name: "Lime Wheel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Manhattan",
      description: "Rich, complex, and sophisticated. The king of stirred cocktails.",
      instructions:
        "Add rye, sweet vermouth, and bitters to a mixing glass with ice. Stir for 30 seconds. Strain into a chilled coupe or nick & nora glass. Garnish with a cherry.",
      glassType: "nick-nora" as const,
      garnish: "Maraschino cherry",
      ingredients: [
        { name: "Rye Whiskey", amount: 2, unit: "oz" as const },
        { name: "Sweet Vermouth", amount: 1, unit: "oz" as const },
        { name: "Angostura Bitters", amount: 2, unit: "dash" as const },
        { name: "Maraschino Cherry", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Aperol Spritz",
      description: "Light, bubbly, and bittersweet. The ultimate summer aperitif.",
      instructions:
        "Fill a wine glass with ice. Add Aperol, then prosecco. Top with a splash of soda water. Stir gently.",
      glassType: "flute" as const,
      garnish: "Orange slice",
      ingredients: [
        { name: "Aperol", amount: 2, unit: "oz" as const },
        { name: "Prosecco", amount: 3, unit: "oz" as const },
        { name: "Soda Water", amount: 1, unit: "oz" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Moscow Mule",
      description: "Spicy ginger, tart lime, and vodka in perfect harmony.",
      instructions:
        "Add vodka and lime juice to a copper mug filled with ice. Top with ginger beer. Stir gently. Garnish with lime wheel and mint.",
      glassType: "highball" as const,
      garnish: "Lime wheel, mint sprig",
      ingredients: [
        { name: "Vodka", amount: 2, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 0.5, unit: "oz" as const },
        { name: "Ginger Beer", amount: 4, unit: "oz" as const },
        { name: "Lime Wheel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Martini",
      description: "The most iconic cocktail in the world. Clean, cold, and impossibly elegant.",
      instructions:
        "Add gin and vermouth to a mixing glass with ice. Stir for 30 seconds until very cold. Strain into a chilled coupe or martini glass. Garnish with a lemon peel or olive.",
      glassType: "coupe" as const,
      garnish: "Lemon peel or olive",
      ingredients: [
        { name: "London Dry Gin", amount: 2.5, unit: "oz" as const },
        { name: "Dry Vermouth", amount: 0.5, unit: "oz" as const },
        { name: "Orange Bitters", amount: 1, unit: "dash" as const },
      ],
    },
  ];

  for (const r of recipesData) {
    const [recipe] = await db
      .insert(schema.recipes)
      .values({
        name: r.name,
        description: r.description,
        instructions: r.instructions,
        glassType: r.glassType,
        garnish: r.garnish,
      })
      .returning();

    await db.insert(schema.recipeIngredients).values(
      r.ingredients.map((ing) => ({
        recipeId: recipe.id,
        ingredientId: id(ing.name),
        amount: ing.amount,
        unit: ing.unit,
      }))
    );

    console.log(`  Created recipe: ${r.name}`);
  }

  console.log(`\nInserted ${recipesData.length} recipes`);
  console.log("\nDone!");
  await pool.end();
}

seed().catch(console.error);
