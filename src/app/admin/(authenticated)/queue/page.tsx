import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActiveOrders } from "@/lib/queries/orders";
import { QueueClient } from "@/components/queue/queue-client";

export default async function QueuePage() {
  const t = await getTranslations("admin.queue");

  const activeEvent = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  if (!activeEvent) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("title")}
        </h1>
        <p className="text-text-muted text-center py-8">{t("empty")}</p>
      </div>
    );
  }

  const initialOrders = await getActiveOrders(activeEvent.id);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-accent-gold">
        {t("title")}
      </h1>
      <QueueClient
        eventId={activeEvent.id}
        initialOrders={JSON.parse(JSON.stringify(initialOrders))}
      />
    </div>
  );
}
