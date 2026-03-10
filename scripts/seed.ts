import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...\n");

  // Clear existing data (order matters due to foreign keys)
  console.log("Clearing existing data...");
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.eventMenuItems);
  await db.delete(schema.events);
  await db.delete(schema.recipeIngredients);
  await db.delete(schema.recipes);
  await db.delete(schema.ingredients);

  // --- Ingredients ---

  const spirits = [
    { name: "Bourbon", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Rye Whiskey", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "London Dry Gin", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Vodka", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "White Rum", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Tequila Blanco", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Campari", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Sweet Vermouth", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Dry Vermouth", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Cointreau", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Blue Curaçao", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Midori", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Baileys", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Blackcurrant Liqueur", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Seedlip 108", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 8 },
    { name: "Seedlip 94", category: "spirit" as const, unit: "oz" as const, quantityOnHand: 8 },
  ];

  const mixers = [
    { name: "Simple Syrup", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Fresh Lime Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Fresh Lemon Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Orange Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Cranberry Juice", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Soda Water", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 64 },
    { name: "Tonic Water", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 48 },
    { name: "Ginger Beer", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 32 },
    { name: "Egg White", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 8 },
    { name: "Grenadine", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Yakult", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Coconut Milk", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Coconut Water", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 16 },
    { name: "Cream", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Jasmine Oolong Tea", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 24 },
    { name: "Cream Cap", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 12 },
    { name: "Lavender Syrup", category: "mixer" as const, unit: "oz" as const, quantityOnHand: 8 },
  ];

  const bitters = [
    { name: "Angostura Bitters", category: "bitter" as const, unit: "dash" as const, quantityOnHand: 50 },
  ];

  const garnishes = [
    { name: "Orange Peel", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Lime Wheel", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Maraschino Cherry", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 30 },
    { name: "Mint Sprig", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Olive", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 20 },
    { name: "Cocoa Powder", category: "garnish" as const, unit: "piece" as const, quantityOnHand: 10 },
  ];

  const allIngredients = [...spirits, ...mixers, ...bitters, ...garnishes];
  const inserted = await db
    .insert(schema.ingredients)
    .values(allIngredients)
    .returning();

  const byName = new Map(inserted.map((i) => [i.name, i]));
  console.log(`Inserted ${inserted.length} ingredients`);

  const id = (name: string) => {
    const ing = byName.get(name);
    if (!ing) throw new Error(`Ingredient not found: ${name}`);
    return ing.id;
  };

  // --- Recipes ---

  const recipesData = [
    {
      name: "Mojito",
      description: "朗姆酒配薄荷青柠苏打，清爽微甜，适合夏天",
      instructions: "杯中放入薄荷叶和青柠角，轻捣出香味。加冰，倒入朗姆酒和糖浆，加苏打水搅拌。",
      glassType: "highball" as const,
      garnish: "Mint",
      baseSpirit: "Rum",
      flavor: "晒太阳☀️",
      characteristics: "清爽、微甜、薄荷香",
      abv: 2,
      ingredients: [
        { name: "White Rum", amount: 2, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 1, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.75, unit: "oz" as const },
        { name: "Soda Water", amount: 2, unit: "oz" as const },
        { name: "Mint Sprig", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Manhattan",
      description: "威士忌搭配甜苦艾酒和苦精，浓郁醇厚的经典",
      instructions: "将黑麦威士忌、甜苦艾酒和苦精加冰搅拌30秒，滤入鸡尾酒杯，放入酒樱桃。",
      glassType: "coupe" as const,
      garnish: "Maraschino Cherry",
      baseSpirit: "Whiskey",
      flavor: "深夜流浪🎑",
      characteristics: "浓郁、微苦、甘甜收尾",
      abv: 5,
      ingredients: [
        { name: "Rye Whiskey", amount: 2, unit: "oz" as const },
        { name: "Sweet Vermouth", amount: 1, unit: "oz" as const },
        { name: "Angostura Bitters", amount: 2, unit: "dash" as const },
        { name: "Maraschino Cherry", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Martini",
      description: "金酒配干苦艾，干净利落，经典中的经典",
      instructions: "金酒和干苦艾酒加冰搅拌30秒至充分冰镇，滤入冰过的鸡尾酒杯，放入橄榄。",
      glassType: "coupe" as const,
      garnish: "Olive",
      baseSpirit: "Gin",
      flavor: "深夜流浪🎑",
      characteristics: "干爽、草本、烈",
      abv: 5,
      ingredients: [
        { name: "London Dry Gin", amount: 2.5, unit: "oz" as const },
        { name: "Dry Vermouth", amount: 0.5, unit: "oz" as const },
        { name: "Olive", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Old Fashioned",
      description: "波本加糖和苦精，简单直接的威士忌鸡尾酒",
      instructions: "杯中加入糖浆和苦精搅匀，放入大冰块，倒入波本威士忌，缓慢搅拌，削橙皮喷洒油脂。",
      glassType: "rocks" as const,
      garnish: "Orange",
      baseSpirit: "Whiskey",
      flavor: "深夜流浪🎑",
      characteristics: "酒感强、微甜、橙皮香",
      abv: 5,
      ingredients: [
        { name: "Bourbon", amount: 2, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.25, unit: "oz" as const },
        { name: "Angostura Bitters", amount: 3, unit: "dash" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Negroni",
      description: "金酒、金巴利、甜苦艾等比调配，苦甜平衡",
      instructions: "三种酒等量倒入调酒杯，加冰搅拌30秒，滤入加了大冰块的岩石杯，用橙皮装饰。",
      glassType: "rocks" as const,
      garnish: "Orange",
      baseSpirit: "Gin",
      flavor: "深夜流浪🎑",
      characteristics: "苦、草本、微甜、橙香",
      abv: 5,
      ingredients: [
        { name: "London Dry Gin", amount: 1, unit: "oz" as const },
        { name: "Campari", amount: 1, unit: "oz" as const },
        { name: "Sweet Vermouth", amount: 1, unit: "oz" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Cosmopolitan",
      description: "伏特加配蔓越莓和青柠，酸甜好喝，粉红色",
      instructions: "所有材料加冰摇匀15秒，滤入冰过的鸡尾酒杯，挤青柠皮油装饰。",
      glassType: "coupe" as const,
      garnish: "Lime",
      baseSpirit: "Vodka",
      flavor: "晒太阳☀️",
      characteristics: "酸甜、果味、易入口",
      abv: 2,
      ingredients: [
        { name: "Vodka", amount: 1.5, unit: "oz" as const },
        { name: "Cointreau", amount: 0.75, unit: "oz" as const },
        { name: "Cranberry Juice", amount: 1, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 0.5, unit: "oz" as const },
      ],
    },
    {
      name: "Whiskey Sour",
      description: "威士忌配柠檬蛋白，酸甜顺滑，层次丰富",
      instructions: "所有材料先干摇（无冰）10秒打发蛋白，再加冰猛摇15秒，滤入岩石杯，表面点缀苦精。",
      glassType: "rocks" as const,
      garnish: "Cherry, Orange",
      baseSpirit: "Whiskey",
      flavor: "深夜流浪🎑",
      characteristics: "酸甜、奶泡口感、柠檬香",
      abv: 4,
      ingredients: [
        { name: "Bourbon", amount: 2, unit: "oz" as const },
        { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.75, unit: "oz" as const },
        { name: "Egg White", amount: 1, unit: "oz" as const },
        { name: "Maraschino Cherry", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Coral Sea",
      description: "朗姆酒配养乐多和蓝橙，酸甜清新，带果香",
      instructions: "朗姆酒、柠檬汁、养乐多加冰摇匀，滤入岩石杯，缓缓倒入蓝橙力娇酒，用薄荷装饰。",
      glassType: "rocks" as const,
      garnish: "Mint",
      baseSpirit: "Rum",
      flavor: "晒太阳☀️",
      characteristics: "酸甜、乳酸菌味、柑橘果香",
      abv: 2,
      ingredients: [
        { name: "White Rum", amount: 1.5, unit: "oz" as const },
        { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" as const },
        { name: "Yakult", amount: 2, unit: "oz" as const },
        { name: "Blue Curaçao", amount: 0.5, unit: "oz" as const },
        { name: "Mint Sprig", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "Sixty Forty",
      description: "金酒和威士忌的混合，兼具马天尼和曼哈顿的特点",
      instructions: "金酒、威士忌、Seedlip 108和94加冰搅拌30秒，滤入鸡尾酒杯，以樱桃和橄榄装饰。",
      glassType: "coupe" as const,
      garnish: "Cherry, Olive",
      baseSpirit: "Gin, Whiskey",
      flavor: "深夜流浪🎑",
      characteristics: "草本香、微酸、层次分明",
      abv: 4,
      ingredients: [
        { name: "London Dry Gin", amount: 1, unit: "oz" as const },
        { name: "Rye Whiskey", amount: 1, unit: "oz" as const },
        { name: "Seedlip 108", amount: 0.5, unit: "oz" as const },
        { name: "Seedlip 94", amount: 0.5, unit: "oz" as const },
        { name: "Maraschino Cherry", amount: 1, unit: "piece" as const },
        { name: "Olive", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "橙花 Orange Blossom No. 2",
      description: "金酒配橙汁和石榴糖浆，禁酒令时期的经典",
      instructions: "金酒、君度、橙汁、青柠汁和石榴糖浆加冰摇匀，滤入鸡尾酒杯，青柠片装饰。",
      glassType: "coupe" as const,
      garnish: "Lime",
      baseSpirit: "Gin",
      flavor: "晒太阳☀️",
      characteristics: "果味、微甜、柑橘调",
      abv: 2,
      ingredients: [
        { name: "London Dry Gin", amount: 1.5, unit: "oz" as const },
        { name: "Cointreau", amount: 0.5, unit: "oz" as const },
        { name: "Orange Juice", amount: 1, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 0.5, unit: "oz" as const },
        { name: "Grenadine", amount: 0.25, unit: "oz" as const },
      ],
    },
    {
      name: "橙子海",
      description: "金酒配橙汁和蓝橙，清爽甜美的夏日饮品",
      instructions: "金酒、橙汁加冰摇匀，滤入鸡尾酒杯，缓缓倒入蓝橙力娇酒形成渐层，橙片装饰。",
      glassType: "coupe" as const,
      garnish: "Orange",
      baseSpirit: "Gin",
      flavor: "晒太阳☀️",
      characteristics: "甜、柑橘味、清爽",
      abv: 3,
      ingredients: [
        { name: "London Dry Gin", amount: 1.5, unit: "oz" as const },
        { name: "Orange Juice", amount: 2, unit: "oz" as const },
        { name: "Blue Curaçao", amount: 0.5, unit: "oz" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "海王星 Neptune",
      description: "金酒配椰奶和蓝橙，热带风味",
      instructions: "金酒、椰奶、椰子水和蓝橙力娇酒加冰摇匀，滤入碟形杯。",
      glassType: "coupe" as const,
      garnish: null,
      baseSpirit: "Gin",
      flavor: "晒太阳☀️",
      characteristics: "椰香、顺滑、热带风",
      abv: 1,
      ingredients: [
        { name: "London Dry Gin", amount: 1.5, unit: "oz" as const },
        { name: "Coconut Milk", amount: 1, unit: "oz" as const },
        { name: "Coconut Water", amount: 1, unit: "oz" as const },
        { name: "Blue Curaçao", amount: 0.5, unit: "oz" as const },
      ],
    },
    {
      name: "Gran Torino 大都灵",
      description: "波本配黑加仑和奶油，石垣忍原创鸡尾酒",
      instructions: "波本威士忌和黑加仑力娇酒加冰搅拌，滤入岩石杯加大冰块，表面铺奶油，撒可可粉。",
      glassType: "rocks" as const,
      garnish: "Cocoa Powder",
      baseSpirit: "Whiskey",
      flavor: "深夜流浪🎑",
      characteristics: "浓郁、甜中带苦、奶香",
      abv: 4,
      ingredients: [
        { name: "Bourbon", amount: 2, unit: "oz" as const },
        { name: "Blackcurrant Liqueur", amount: 0.75, unit: "oz" as const },
        { name: "Cream", amount: 0.5, unit: "oz" as const },
        { name: "Cocoa Powder", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "暮色信差",
      description: "黑加仑配茉莉乌龙茶和奶盖，无基酒的茶饮风格",
      instructions: "茉莉乌龙茶冷泡，加入黑加仑力娇酒搅匀，倒入高球杯加冰，顶层打奶盖。",
      glassType: "highball" as const,
      garnish: "Cream Cap",
      baseSpirit: null,
      flavor: "晒太阳☀️",
      characteristics: "茶香、微甜、奶盖顺滑",
      abv: 1,
      ingredients: [
        { name: "Jasmine Oolong Tea", amount: 3, unit: "oz" as const },
        { name: "Blackcurrant Liqueur", amount: 1, unit: "oz" as const },
        { name: "Cream Cap", amount: 1, unit: "oz" as const },
      ],
    },
    {
      name: "蜜瓜幻影 Midori Sour",
      description: "朗姆酒配蜜瓜力娇酒和柠檬，酸甜鲜绿色",
      instructions: "朗姆酒、Midori、柠檬汁、糖浆和蛋白干摇10秒，加冰猛摇15秒，滤入岩石杯。",
      glassType: "rocks" as const,
      garnish: null,
      baseSpirit: "Rum",
      flavor: "晒太阳☀️",
      characteristics: "蜜瓜味、酸甜、泡沫口感",
      abv: 3,
      ingredients: [
        { name: "White Rum", amount: 1.5, unit: "oz" as const },
        { name: "Midori", amount: 1, unit: "oz" as const },
        { name: "Fresh Lemon Juice", amount: 0.75, unit: "oz" as const },
        { name: "Simple Syrup", amount: 0.5, unit: "oz" as const },
        { name: "Egg White", amount: 1, unit: "oz" as const },
      ],
    },
    {
      name: "龙舌兰日出",
      description: "龙舌兰配橙汁和石榴糖浆，颜色像日出渐变",
      instructions: "龙舌兰和橙汁加冰倒入高球杯搅匀，沿杯壁缓缓倒入石榴糖浆让其自然沉底，用橙片和樱桃装饰。",
      glassType: "highball" as const,
      garnish: "Cherry, Orange",
      baseSpirit: "Tequila",
      flavor: "晒太阳☀️",
      characteristics: "果味、微甜、好看",
      abv: 2,
      ingredients: [
        { name: "Tequila Blanco", amount: 1.5, unit: "oz" as const },
        { name: "Orange Juice", amount: 3, unit: "oz" as const },
        { name: "Grenadine", amount: 0.5, unit: "oz" as const },
        { name: "Maraschino Cherry", amount: 1, unit: "piece" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "青见",
      description: "金酒配汤力水，抹茶风味的金汤力变体",
      instructions: "杯中加冰，倒入金酒和少量抹茶，加汤力水轻搅，橙片装饰。",
      glassType: "rocks" as const,
      garnish: "Orange",
      baseSpirit: "Gin",
      flavor: "晒太阳☀️",
      characteristics: "抹茶味、微苦、气泡感",
      abv: 2,
      ingredients: [
        { name: "London Dry Gin", amount: 2, unit: "oz" as const },
        { name: "Tonic Water", amount: 3, unit: "oz" as const },
        { name: "Orange Peel", amount: 1, unit: "piece" as const },
      ],
    },
    {
      name: "笑场",
      description: "百利甜配橙汁和君度，奶甜中带橙香",
      instructions: "百利甜、君度和橙汁加冰摇匀，滤入岩石杯加冰。",
      glassType: "rocks" as const,
      garnish: null,
      baseSpirit: null,
      flavor: "晒太阳☀️",
      characteristics: "奶甜、橙味、顺滑",
      abv: 2,
      ingredients: [
        { name: "Baileys", amount: 1.5, unit: "oz" as const },
        { name: "Cointreau", amount: 0.5, unit: "oz" as const },
        { name: "Orange Juice", amount: 1.5, unit: "oz" as const },
      ],
    },
    {
      name: "薰衣草骡子",
      description: "伏特加配姜啤和薰衣草糖浆，Moscow Mule的花香版",
      instructions: "伏特加、薰衣草糖浆和青柠汁加冰摇匀，倒入铜杯加冰，加姜啤搅拌，薄荷和青柠装饰。",
      glassType: "highball" as const,
      garnish: "Lime, Mint",
      baseSpirit: "Vodka",
      flavor: "晒太阳☀️",
      characteristics: "花香、姜辣、气泡感",
      abv: 2,
      ingredients: [
        { name: "Vodka", amount: 1.5, unit: "oz" as const },
        { name: "Ginger Beer", amount: 3, unit: "oz" as const },
        { name: "Lavender Syrup", amount: 0.5, unit: "oz" as const },
        { name: "Fresh Lime Juice", amount: 0.75, unit: "oz" as const },
        { name: "Mint Sprig", amount: 1, unit: "piece" as const },
        { name: "Lime Wheel", amount: 1, unit: "piece" as const },
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
        baseSpirit: r.baseSpirit,
        flavor: r.flavor,
        characteristics: r.characteristics,
        abv: r.abv,
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
