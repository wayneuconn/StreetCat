import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { events, orders, eventMenuItems } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const t = await getTranslations("admin.dashboard");

  const activeEvent = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  let pendingCount = 0;
  let totalCount = 0;
  let menuCount = 0;

  if (activeEvent) {
    const [pending] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(eq(orders.eventId, activeEvent.id), eq(orders.status, "pending"))
      );
    pendingCount = pending.count;

    const [total] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.eventId, activeEvent.id));
    totalCount = total.count;

    const [menu] = await db
      .select({ count: count() })
      .from(eventMenuItems)
      .where(eq(eventMenuItems.eventId, activeEvent.id));
    menuCount = menu.count;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-accent-gold">
        {t("title")}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-text-muted">{t("activeEvent")}</p>
          <p className="mt-1 font-heading text-lg text-accent-gold">
            {activeEvent?.name || "—"}
          </p>
        </div>
        <Link href="/admin/queue" className="card card-hover">
          <p className="text-sm text-text-muted">{t("pendingOrders")}</p>
          <p className="mt-1 font-heading text-2xl text-accent-gold">
            {pendingCount}
          </p>
        </Link>
        <div className="card">
          <p className="text-sm text-text-muted">{t("totalOrders")}</p>
          <p className="mt-1 font-heading text-2xl text-text-primary">
            {totalCount}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-text-muted">{t("menuItems")}</p>
          <p className="mt-1 font-heading text-2xl text-text-primary">
            {menuCount}
          </p>
        </div>
      </div>
    </div>
  );
}
