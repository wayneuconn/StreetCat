import { getTranslations } from "next-intl/server";
import { getAllEvents } from "@/lib/queries/events";
import { toggleEventActive, deleteEvent } from "@/lib/actions/events";
import Link from "next/link";

export default async function EventsPage() {
  const t = await getTranslations("admin.events");
  const tc = await getTranslations("common");
  const eventList = await getAllEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-accent-gold">
          {t("title")}
        </h1>
        <Link href="/admin/events/new" className="btn-primary text-sm">
          {t("addEvent")}
        </Link>
      </div>

      {eventList.length === 0 ? (
        <p className="text-text-muted text-center py-8">{tc("noResults")}</p>
      ) : (
        <div className="space-y-2">
          {eventList.map((event) => (
            <div key={event.id} className="card">
              <div className="flex items-center justify-between">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="flex-1"
                >
                  <h3 className="font-heading text-lg text-accent-gold hover:text-accent-gold-light transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex gap-3 mt-1 text-xs text-text-muted">
                    <span>
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span>
                      {t("expectedGuests")}: {event.expectedGuests}
                    </span>
                    <span>
                      {t("orderCount")}: {event.orders.length}
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <form action={toggleEventActive}>
                    <input type="hidden" name="id" value={event.id} />
                    <input
                      type="hidden"
                      name="isActive"
                      value={String(event.isActive)}
                    />
                    <button
                      type="submit"
                      className={`badge text-xs ${
                        event.isActive
                          ? "badge-ready"
                          : "badge-picked_up"
                      }`}
                    >
                      {event.isActive ? t("isActive") : "OFF"}
                    </button>
                  </form>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <button
                      type="submit"
                      className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
                    >
                      {tc("delete")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
