import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/queries/orders";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    guestName: order.guestName,
    items: order.items.map((item) => ({
      name: item.menuItem.recipe.name,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}
