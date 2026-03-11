/**
 * Sync ingredients: adds any missing ingredients to the DB without
 * touching existing data. Safe to run repeatedly.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const s = (name: string, qty = 0) => ({ name, category: "spirit" as const, unit: "oz" as const, quantityOnHand: qty });
const l = (name: string, qty = 0) => ({ name, category: "liqueur" as const, unit: "oz" as const, quantityOnHand: qty });
const j = (name: string, qty = 0) => ({ name, category: "juice" as const, unit: "oz" as const, quantityOnHand: qty });
const m = (name: string, qty = 0, unit: "oz" | "ml" | "piece" | "bottle" = "oz") => ({ name, category: "mixer" as const, unit, quantityOnHand: qty });
const b = (name: string, qty = 0) => ({ name, category: "bitter" as const, unit: "dash" as const, quantityOnHand: qty });
const g = (name: string, qty = 0) => ({ name, category: "garnish" as const, unit: "piece" as const, quantityOnHand: qty });

const ALL_INGREDIENTS = [
  // Spirits
  s("Bourbon"), s("Rye Whiskey"), s("Scotch Whisky"), s("Irish Whiskey"),
  s("Japanese Whisky"), s("Tennessee Whiskey"),
  s("London Dry Gin"), s("Plymouth Gin"), s("Old Tom Gin"), s("Navy Strength Gin"),
  s("Hendrick's Gin"), s("Tanqueray"),
  s("Vodka"), s("Absolut"), s("Grey Goose"), s("Flavored Vodka"),
  s("White Rum"), s("Dark Rum"), s("Aged Rum"), s("Overproof Rum"),
  s("Coconut Rum"), s("Spiced Rum"),
  s("Tequila Blanco"), s("Tequila Reposado"), s("Tequila Añejo"), s("Mezcal"),
  s("Cognac"), s("Brandy"), s("Pisco"), s("Calvados"),
  s("Campari"), s("Aperol"), s("Sweet Vermouth"), s("Dry Vermouth"),
  s("Lillet Blanc"), s("Pimm's No.1"),
  s("Baijiu 白酒"), s("Sake 清酒"), s("Soju 烧酒"), s("Shochu 焼酎"),
  s("Absinthe"),

  // Liqueurs
  l("Cointreau"), l("Grand Marnier"), l("Blue Curaçao"), l("Triple Sec"),
  l("Midori"), l("Chambord"), l("Peach Schnapps"), l("Malibu"),
  l("Limoncello"), l("Maraschino Liqueur"), l("Crème de Cassis"),
  l("Blackcurrant Liqueur"), l("Passion Fruit Liqueur"), l("Lychee Liqueur"),
  l("Banana Liqueur"), l("Strawberry Liqueur"), l("Mango Liqueur"),
  l("Baileys"), l("Kahlúa"), l("Amaretto"), l("Frangelico"),
  l("Crème de Cacao"), l("Mozart Chocolate"),
  l("Chartreuse Green"), l("Chartreuse Yellow"), l("Bénédictine"), l("Galliano"),
  l("St-Germain Elderflower"), l("Drambuie"), l("Jägermeister"),
  l("Seedlip 108"), l("Seedlip 94"), l("Lyre's Dry London"),

  // Juices
  j("Fresh Lime Juice"), j("Fresh Lemon Juice"),
  j("Orange Juice"), j("Grapefruit Juice"), j("Pineapple Juice"),
  j("Cranberry Juice"), j("Apple Juice"), j("Tomato Juice"),
  j("Passion Fruit Juice"), j("Mango Juice"), j("Peach Juice"),
  j("Lychee Juice"), j("Watermelon Juice"), j("Pomegranate Juice"),
  j("Guava Juice"), j("Yuzu Juice 柚子汁"), j("Calamansi Juice 金桔汁"),
  j("水溶C100 柠檬味"), j("水溶C100 西柚味"),

  // Mixers
  m("Simple Syrup"), m("Rich Simple Syrup"), m("Demerara Syrup"),
  m("Honey Syrup"), m("Agave Syrup"), m("Maple Syrup"),
  m("Grenadine"), m("Orgeat"), m("Lavender Syrup"),
  m("Rose Syrup"), m("Vanilla Syrup"), m("Cinnamon Syrup"),
  m("Ginger Syrup"), m("Passion Fruit Syrup"), m("Matcha Syrup 抹茶糖浆"),
  m("Brown Sugar Syrup 黑糖糖浆"), m("Osmanthus Syrup 桂花糖浆"),
  m("Soda Water"), m("Tonic Water"), m("Ginger Beer"), m("Ginger Ale"),
  m("Cola"), m("Sprite / 7-Up"), m("Red Bull"),
  m("Egg White"), m("Whole Egg"), m("Cream"), m("Cream Cap"),
  m("Heavy Cream"), m("Coconut Cream"), m("Condensed Milk"),
  m("Half & Half"), m("Oat Milk 燕麦奶"), m("Almond Milk 杏仁奶"),
  m("Coconut Milk"), m("Coconut Water"),
  m("Jasmine Oolong Tea"), m("Earl Grey Tea"), m("Matcha Powder"),
  m("Espresso"), m("Cold Brew Coffee"), m("Hojicha 焙茶"),
  m("Pu-erh Tea 普洱茶"), m("Chrysanthemum Tea 菊花茶"),
  m("Yakult 养乐多"), m("Calpico 可尔必思"),
  m("Coconut Jelly 椰果"), m("Lychee Jelly 荔枝果冻"),
  m("Konjac Jelly 蒟蒻果冻"), m("Nata de Coco"),
  m("Tapioca Pearls 珍珠"), m("Aloe Vera Pulp 芦荟果肉"),
  m("Red Bean Paste 红豆沙"), m("Taro Paste 芋泥"),
  m("Peanut Butter 花生酱"),
  m("Worcestershire Sauce"), m("Tabasco"), m("Celery Salt"),
  m("Salt Solution 盐水"), m("Aquafaba 鹰嘴豆水"),

  // Bitters
  b("Angostura Bitters"), b("Orange Bitters"), b("Peychaud's Bitters"),
  b("Chocolate Bitters"), b("Mole Bitters"), b("Celery Bitters"),
  b("Lavender Bitters"), b("Fee Brothers Whiskey Barrel Aged"),

  // Garnishes
  g("Orange Peel"), g("Lemon Peel"), g("Lime Wheel"), g("Lemon Wheel"),
  g("Grapefruit Peel"), g("Dried Orange Slice 干橙片"), g("Dried Lemon Slice 干柠檬片"),
  g("Dried Lime Slice 干青柠片"), g("Dehydrated Citrus Wheel 脱水柑橘片"),
  g("Maraschino Cherry"), g("Luxardo Cherry"),
  g("Pineapple Wedge"), g("Strawberry"), g("Raspberry"), g("Blueberry"),
  g("Banana Slice"), g("Apple Slice"), g("Star Fruit Slice 杨桃片"),
  g("Dragon Fruit Slice 火龙果片"), g("Lychee 荔枝"),
  g("Mint Sprig"), g("Basil Leaf"), g("Rosemary Sprig"), g("Thyme Sprig"),
  g("Lavender Sprig"), g("Edible Flower 食用花"), g("Rose Petal 玫瑰花瓣"),
  g("Butterfly Pea Flower 蝶豆花"), g("Osmanthus 桂花"),
  g("Olive"), g("Celery Stalk"), g("Cucumber Ribbon"), g("Jalapeño Slice"),
  g("Ginger Slice"), g("Star Anise 八角"), g("Cinnamon Stick"), g("Nutmeg 肉豆蔻"),
  g("Cocoa Powder"), g("Matcha Powder 抹茶粉"),
  g("Salt Rim 盐边"), g("Sugar Rim 糖边"), g("Tajin Rim"),
  g("Cocktail Umbrella"), g("Cocktail Pick"), g("Bamboo Skewer 竹签"),
  g("Cotton Candy 棉花糖"), g("Whipped Cream 奶油"),
  g("Marshmallow 棉花糖"), g("Chocolate Shavings 巧克力碎"),
  g("Toasted Coconut Flakes 烤椰丝"),
];

async function sync() {
  console.log("Syncing ingredients...\n");

  let added = 0;
  let skipped = 0;

  for (const ing of ALL_INGREDIENTS) {
    const existing = await db.query.ingredients.findFirst({
      where: eq(schema.ingredients.name, ing.name),
    });

    if (existing) {
      skipped++;
    } else {
      await db.insert(schema.ingredients).values(ing);
      console.log(`  + ${ing.name} (${ing.category}, ${ing.unit})`);
      added++;
    }
  }

  console.log(`\nDone: ${added} added, ${skipped} already existed.`);
  await pool.end();
}

sync().catch(console.error);
