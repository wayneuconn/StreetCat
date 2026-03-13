"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  ingredients,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { emitOrderEvent } from "@/lib/events";

/** Convert an amount from one unit to another (volume units via oz). */
function convertUnit(amount: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return amount;
  const toOz: Record<string, number> = { oz: 1, ml: 1 / 29.5735, bottle: 25.36 };
  if (fromUnit in toOz && toUnit in toOz) {
    return amount * toOz[fromUnit] / toOz[toUnit];
  }
  return amount;
}

type OrderItemInput = {
  menuItemId: string;
  quantity: number;
};

export async function placeOrder(formData: FormData) {
  const eventId = formData.get("eventId") as string;
  const guestName = formData.get("guestName") as string;
  const itemsJson = formData.get("items") as string;
  const items: OrderItemInput[] = JSON.parse(itemsJson);

  if (!guestName || items.length === 0) {
    return { error: "Name and at least one drink required" };
  }

  const [order] = await db
    .insert(orders)
    .values({
      eventId,
      guestName,
    })
    .returning();

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }))
  );

  emitOrderEvent({
    type: "new_order",
    orderId: order.id,
    eventId,
  });

  redirect(`/order/${order.id}/status`);
}

export async function updateOrderStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as
    | "pending"
    | "making"
    | "ready"
    | "picked_up";

  const [order] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  // When bartender starts making: deduct ingredients and auto-86 if needed
  if (status === "making") {
    await deductInventory(id, order.eventId);
  }

  emitOrderEvent({
    type: "status_change",
    orderId: id,
    eventId: order.eventId,
    status,
  });

  revalidatePath("/admin/queue");
  revalidatePath("/admin/inventory");
}

/**
 * Deduct ingredient quantities for all items in an order.
 * Then check if any ingredient is depleted and auto-86 affected menu items.
 */
async function deductInventory(orderId: string, eventId: string) {
  // Get order items with recipe ingredients
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
    with: {
      menuItem: {
        with: {
          recipe: {
            with: {
              recipeIngredients: {
                with: { ingredient: true },
              },
            },
          },
        },
      },
    },
  });

  // Aggregate deductions per ingredient
  const deductions = new Map<string, number>();
  for (const item of items) {
    for (const ri of item.menuItem.recipe.recipeIngredients) {
      const current = deductions.get(ri.ingredientId) || 0;
      const converted = convertUnit(ri.amount, ri.unit, ri.ingredient.unit);
      deductions.set(ri.ingredientId, current + converted * item.quantity);
    }
  }

  // Apply deductions
  for (const [ingredientId, amount] of deductions) {
    await db
      .update(ingredients)
      .set({
        quantityOnHand: sql`GREATEST(0, ${ingredients.quantityOnHand} - ${amount})`,
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, ingredientId));
  }

}
