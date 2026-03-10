import { getActiveEvent } from "@/lib/queries/events";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function MenuPage() {
  const t = await getTranslations("menu");
  const event = await getActiveEvent();

  if (!event) {
    return (
      <GuestShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-muted text-lg">{t("noActiveEvent")}</p>
        </div>
      </GuestShell>
    );
  }

  const availableItems = event.menuItems.filter((item) => item.available);

  return (
    <GuestShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-accent-gold">
            {t("title")}
          </h1>
          <p className="mt-1 text-text-secondary">{t("subtitle")}</p>
          <div className="divider my-4">
            <span className="text-text-muted text-xs">~ ~ ~</span>
          </div>
        </div>

        <div className="space-y-4">
          {availableItems.map((item, i) => (
            <Link
              key={item.id}
              href={`/menu/${item.id}`}
              className={`card card-hover block animate-fade-up stagger-${Math.min(i + 1, 6)} overflow-hidden`}
            >
              {item.recipe.imageUrl && (
                <div className="w-full aspect-[3/2] -mx-[1.25rem] -mt-[1.25rem] mb-3 overflow-hidden"
                  style={{ width: "calc(100% + 2.5rem)" }}>
                  <img
                    src={item.recipe.imageUrl}
                    alt={item.recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                      <span>{t("baseSpirit")}: {item.recipe.baseSpirit}</span>
                    )}
                    {item.recipe.flavor && (
                      <span>{t("flavor")}: {item.recipe.flavor}</span>
                    )}
                    {item.recipe.abv != null && (
                      <span>{t("abv")} {item.recipe.abv}%</span>
                    )}
                  </div>
                </div>
                {item.recipe.price != null && (
                  <span className="font-heading text-lg text-accent-gold ml-3 whitespace-nowrap">
                    ¥{item.recipe.price}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {availableItems.length > 0 && (
          <div className="pt-4 text-center">
            <Link href="/order" className="btn-primary inline-block">
              {t("orderThis")}
            </Link>
          </div>
        )}
      </div>
    </GuestShell>
  );
}
