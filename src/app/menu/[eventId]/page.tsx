import { getEvent } from "@/lib/queries/events";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { QuickAddButton } from "@/components/order/quick-add-button";
import { SaveEvent, ClearEventButton } from "@/components/save-event";
import { ShareQR } from "@/components/share-qr";

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
          <ClearEventButton label={t("backHome")} />
        </div>
      </GuestShell>
    );
  }

  // Compute sold-out reason per menu item (which ingredient is depleted)
  const soldOutReasons = new Map<string, string>();
  for (const item of event.menuItems) {
    if (!item.available) {
      const depleted = item.recipe.recipeIngredients
        .filter((ri) => ri.ingredient.quantityOnHand <= 0)
        .map((ri) => ri.ingredient.name);
      soldOutReasons.set(
        item.id,
        depleted.length > 0 ? depleted.join(", ") : ""
      );
    }
  }

  // Group by flavor category (include all items)
  const allItems = event.menuItems;
  const grouped = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const category = item.recipe.flavor || "其他";
    const list = grouped.get(category) || [];
    list.push(item);
    grouped.set(category, list);
  }

  const categories = [...grouped.keys()];

  // Track global index for alternating layout
  let globalIndex = 0;

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

        {categories.map((category) => {
          const items = grouped.get(category)!;
          return (
            <div key={category} className="space-y-8">
              <div className="divider my-4">
                <span className="font-heading text-lg text-accent-gold tracking-wider">
                  {category}
                </span>
              </div>

              {items.map((item) => {
                const isImageLeft = globalIndex % 2 === 0;
                globalIndex++;
                const isSoldOut = !item.available;
                const soldOutReason = soldOutReasons.get(item.id);

                const imageBlock = (
                  <Link
                    href={`/menu/${eventId}/${item.id}`}
                    className={`block w-2/5 flex-shrink-0 ${isSoldOut ? "opacity-40 grayscale" : ""}`}
                  >
                    {item.recipe.imageUrl ? (
                      <img
                        src={item.recipe.imageUrl}
                        alt={item.recipe.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-border-gold/10 flex items-center justify-center">
                        <span className="text-3xl text-text-muted/30">🍸</span>
                      </div>
                    )}
                  </Link>
                );

                const textBlock = (
                  <div className={`flex-1 flex flex-col justify-center min-w-0 ${isSoldOut ? "opacity-60" : ""}`}>
                    <Link href={`/menu/${eventId}/${item.id}`}>
                      <h2 className={`font-heading text-lg font-semibold leading-tight ${isSoldOut ? "text-text-muted" : "text-accent-gold"}`}>
                        {item.recipe.name}
                      </h2>
                    </Link>
                    {item.recipe.description && (
                      <p className="mt-1.5 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                        {item.recipe.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                      {item.recipe.abv != null && (
                        <AbvStars level={item.recipe.abv} />
                      )}
                      {item.recipe.price != null && (
                        <span className="text-accent-gold">
                          ¥{item.recipe.price}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      {isSoldOut ? (
                        <span className="text-xs text-accent-burgundy">
                          {soldOutReason
                            ? `out of ${soldOutReason}`
                            : t("unavailable")}
                        </span>
                      ) : (
                        <QuickAddButton
                          menuItemId={item.id}
                          name={item.recipe.name}
                          eventId={eventId}
                        />
                      )}
                    </div>
                  </div>
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 animate-fade-up"
                  >
                    {isImageLeft ? (
                      <>
                        {imageBlock}
                        {textBlock}
                      </>
                    ) : (
                      <>
                        {textBlock}
                        {imageBlock}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </GuestShell>
  );
}
