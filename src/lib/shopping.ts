import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  events,
  eventMenuItems,
  recipeIngredients,
  ingredients,
} from "./db/schema";

export type ShoppingItem = {
  ingredientId: string;
  ingredientName: string;
  category: string;
  needed: number;
  onHand: number;
  toBuy: number;
  unit: string;
};

/** Convert an amount from one unit to another. Returns the amount in targetUnit. */
function convertUnit(amount: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return amount;

  // Normalize to a base unit first, then convert to target
  // Volume: base = oz
  const toOz: Record<string, number> = {
    oz: 1,
    ml: 1 / 29.5735,
    bottle: 25.36, // 750ml bottle
  };

  // If both are volume units, convert via oz
  if (fromUnit in toOz && toUnit in toOz) {
    return amount * toOz[fromUnit] / toOz[toUnit];
  }

  // dash, piece — no meaningful conversion, return as-is
  return amount;
}

export async function calculateShoppingList(
  eventId: string
): Promise<ShoppingItem[]> {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) return [];

  const menuItems = await db.query.eventMenuItems.findMany({
    where: eq(eventMenuItems.eventId, eventId),
    with: {
      recipe: {
        with: {
          recipeIngredients: {
            with: {
              ingredient: true,
            },
          },
        },
      },
    },
  });

  // Aggregate ingredient needs across all recipes
  const needsMap = new Map<
    string,
    {
      ingredientName: string;
      category: string;
      needed: number;
      onHand: number;
      unit: string;
    }
  >();

  for (const item of menuItems) {
    for (const ri of item.recipe.recipeIngredients) {
      const existing = needsMap.get(ri.ingredientId);
      // Convert recipe amount to ingredient's storage unit
      const convertedAmount = convertUnit(ri.amount, ri.unit, ri.ingredient.unit);
      const amountNeeded = convertedAmount * event.expectedGuests;
      if (existing) {
        existing.needed += amountNeeded;
      } else {
        needsMap.set(ri.ingredientId, {
          ingredientName: ri.ingredient.name,
          category: ri.ingredient.category,
          needed: amountNeeded,
          onHand: ri.ingredient.quantityOnHand,
          unit: ri.ingredient.unit,
        });
      }
    }
  }

  // Calculate what to buy (include all items, even satisfied ones)
  const shoppingList: ShoppingItem[] = [];
  for (const [ingredientId, data] of needsMap) {
    const toBuy = Math.max(0, data.needed - data.onHand);
    shoppingList.push({
      ingredientId,
      ...data,
      toBuy,
    });
  }

  // Sort by category
  const categoryOrder = ["spirit", "mixer", "bitter", "garnish", "other"];
  shoppingList.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );

  return shoppingList;
}
