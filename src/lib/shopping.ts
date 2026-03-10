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
      const amountNeeded = ri.amount * event.expectedGuests;
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

  // Calculate what to buy
  const shoppingList: ShoppingItem[] = [];
  for (const [ingredientId, data] of needsMap) {
    const toBuy = Math.max(0, data.needed - data.onHand);
    if (toBuy > 0) {
      shoppingList.push({
        ingredientId,
        ...data,
        toBuy,
      });
    }
  }

  // Sort by category
  const categoryOrder = ["spirit", "mixer", "bitter", "garnish", "other"];
  shoppingList.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );

  return shoppingList;
}
