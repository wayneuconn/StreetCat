"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { emitOrderEvent } from "@/lib/events";

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

  emitOrderEvent({
    type: "status_change",
    orderId: id,
    eventId: order.eventId,
    status,
  });

  revalidatePath("/admin/queue");
}
