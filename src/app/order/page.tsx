import { getActiveEvent } from "@/lib/queries/events";
import { GuestShell } from "@/components/layout/guest-shell";
import { OrderForm } from "@/components/order/order-form";
import { getTranslations } from "next-intl/server";

export default async function OrderPage() {
  const t = await getTranslations();
  const event = await getActiveEvent();

  if (!event) {
    return (
      <GuestShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-muted text-lg">
            {t("menu.noActiveEvent")}
          </p>
        </div>
      </GuestShell>
    );
  }

  const availableItems = event.menuItems.filter((item) => item.available);

  return (
    <GuestShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-accent-gold">
            {t("order.title")}
          </h1>
        </div>
        <OrderForm
          eventId={event.id}
          menuItems={availableItems.map((item) => ({
            id: item.id,
            name: item.recipe.name,
          }))}
        />
      </div>
    </GuestShell>
  );
}
