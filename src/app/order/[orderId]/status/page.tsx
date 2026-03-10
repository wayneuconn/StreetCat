import { notFound } from "next/navigation";
import { getOrder } from "@/lib/queries/orders";
import { GuestShell } from "@/components/layout/guest-shell";
import { OrderStatusCard } from "@/components/order/order-status-card";
import { getTranslations } from "next-intl/server";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const t = await getTranslations("order.status");
  const order = await getOrder(orderId);

  if (!order) notFound();

  return (
    <GuestShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-accent-gold">
            {t("title")}
          </h1>
        </div>
        <OrderStatusCard orderId={orderId} initialStatus={order.status} />
        <div className="card">
          <p className="text-sm text-text-muted mb-2">{order.guestName}</p>
          <ul className="space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.menuItem.recipe.name}</span>
                <span className="text-text-muted">x{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GuestShell>
  );
}
