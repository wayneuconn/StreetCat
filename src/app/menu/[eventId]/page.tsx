import { getEvent } from "@/lib/queries/events";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";
import { SaveEvent, ClearEventButton } from "@/components/save-event";
import { ShareQR } from "@/components/share-qr";
import { MenuContent } from "@/components/menu/menu-content";

export default async function EventMenuPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const t = await getTranslations("menu");
  const event = await getEvent(eventId);

  if (!event) {
    return (
      <GuestShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-muted text-lg">{t("eventEnded")}</p>
          <ClearEventButton label={t("backHome")} />
        </div>
      </GuestShell>
    );
  }

  return (
    <GuestShell>
      <SaveEvent eventId={eventId} />
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-accent-gold">
            {event.name}
          </h1>
          <p className="text-text-secondary">{t("subtitle")}</p>
          <div className="flex justify-center">
            <ShareQR eventId={eventId} eventName={event.name} />
          </div>
        </div>

        <MenuContent
          eventId={eventId}
          menuItems={event.menuItems}
          unavailableLabel={t("unavailable")}
        />
      </div>
    </GuestShell>
  );
}
