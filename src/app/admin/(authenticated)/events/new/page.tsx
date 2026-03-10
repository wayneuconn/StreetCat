import { getTranslations } from "next-intl/server";
import { createEvent } from "@/lib/actions/events";

export default async function NewEventPage() {
  const t = await getTranslations("admin.events");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-accent-gold">
        {t("addEvent")}
      </h1>
      <form action={createEvent} className="card space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("name")}
          </label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("date")}
          </label>
          <input name="date" type="date" required className="input" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("expectedGuests")}
          </label>
          <input
            name="expectedGuests"
            type="number"
            min="1"
            defaultValue="10"
            required
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary">
          {t("addEvent")}
        </button>
      </form>
    </div>
  );
}
