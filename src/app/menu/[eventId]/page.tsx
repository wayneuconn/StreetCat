import { notFound } from "next/navigation";
import { getEvent } from "@/lib/queries/events";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { QuickAddButton } from "@/components/order/quick-add-button";

function AbvStars({ level }: { level: number }) {
  return (
    <span className="text-accent-gold tracking-wider">
      {"★".repeat(level)}
      {"☆".repeat(5 - level)}
    </span>
  );
}

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
        </div>
      </GuestShell>
    );
  }

  const availableItems = event.menuItems.filter((item) => item.available);

  // Group by flavor category (dynamic, preserves data order)
  const grouped = new Map<string, typeof availableItems>();
  for (const item of availableItems) {
    const category = item.recipe.flavor || "其他";
    const list = grouped.get(category) || [];
    list.push(item);
    grouped.set(category, list);
  }

  const categories = [...grouped.keys()];

  return (
    <GuestShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-accent-gold">
            {event.name}
          </h1>
          <p className="mt-1 text-text-secondary">{t("subtitle")}</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <div className="divider my-4">
              <span className="font-heading text-lg text-accent-gold tracking-wider">
                {category}
              </span>
            </div>

            {grouped.get(category)!.map((item, i) => (
              <Link
                key={item.id}
                href={`/menu/${eventId}/${item.id}`}
                className={`card card-hover block animate-fade-up stagger-${Math.min(i + 1, 6)} overflow-hidden`}
              >
                {item.recipe.imageUrl && (
                  <div
                    className="w-full aspect-[3/2] -mx-[1.25rem] -mt-[1.25rem] mb-3 overflow-hidden"
                    style={{ width: "calc(100% + 2.5rem)" }}
                  >
                    <img
                      src={item.recipe.imageUrl}
                      alt={item.recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-xl font-semibold text-accent-gold">
                      {item.recipe.name}
                    </h2>
                    {item.recipe.description && (
                      <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {item.recipe.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                      {item.recipe.baseSpirit && (
                        <span>
                          {t("baseSpirit")}: {item.recipe.baseSpirit}
                        </span>
                      )}
                      {item.recipe.abv != null && (
                        <span>
                          {t("abv")} <AbvStars level={item.recipe.abv} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    {item.recipe.price != null && (
                      <span className="font-heading text-lg text-accent-gold whitespace-nowrap">
                        ¥{item.recipe.price}
                      </span>
                    )}
                    <QuickAddButton
                      menuItemId={item.id}
                      name={item.recipe.name}
                      eventId={eventId}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </GuestShell>
  );
}
