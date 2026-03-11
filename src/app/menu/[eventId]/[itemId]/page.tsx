import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eventMenuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";
import { AddToCartButton } from "@/components/order/add-to-cart-button";

function AbvLevel({ level }: { level: number }) {
  return (
    <span className="tracking-wider">
      <span className="text-text-muted text-[10px] mr-1">烈度</span>
      {"🔥".repeat(level)}
    </span>
  );
}

export default async function CocktailDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; itemId: string }>;
}) {
  const { eventId, itemId } = await params;
  const t = await getTranslations("menu");

  const menuItem = await db.query.eventMenuItems.findFirst({
    where: eq(eventMenuItems.id, itemId),
    with: {
      recipe: {
        with: {
          recipeIngredients: {
            with: { ingredient: true },
          },
        },
      },
    },
  });

  if (!menuItem) notFound();

  const { recipe } = menuItem;

  return (
    <GuestShell>
      <div className="space-y-6">
        <Link
          href={`/menu/${eventId}`}
          className="text-sm text-text-muted hover:text-accent-gold transition-colors"
        >
          &larr; {t("title")}
        </Link>

        <div className="card animate-fade-up overflow-hidden">
          {recipe.imageUrl && (
            <div
              className="w-full aspect-square -mx-[1.25rem] -mt-[1.25rem] mb-4 overflow-hidden bg-bg-secondary/50 flex items-center justify-center"
              style={{ width: "calc(100% + 2.5rem)" }}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex items-start justify-between">
            <h1 className="font-heading text-3xl font-bold text-accent-gold">
              {recipe.name}
            </h1>
            {recipe.price != null && (
              <span className="font-heading text-2xl text-accent-gold ml-3">
                ¥{recipe.price}
              </span>
            )}
          </div>

          {recipe.description && (
            <p className="mt-3 text-text-secondary leading-relaxed">
              {recipe.description}
            </p>
          )}

          <div className="divider my-5">
            <span className="text-text-muted text-xs">~ ~ ~</span>
          </div>

          {recipe.abv != null && (
            <div className="text-sm">
              <span className="text-text-muted">{t("abv")}</span>
              <span className="ml-2">
                <AbvLevel level={recipe.abv} />
              </span>
            </div>
          )}

          {recipe.characteristics && (
            <div className="mt-5 p-3 rounded-lg bg-bg-primary/50 border border-border-gold/50">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                {t("characteristics")}
              </span>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                {recipe.characteristics}
              </p>
            </div>
          )}
        </div>

        {menuItem.available ? (
          <AddToCartButton
            menuItemId={menuItem.id}
            name={recipe.name}
            eventId={eventId}
          />
        ) : (
          <div className="text-center py-3 text-accent-burgundy text-sm">
            {t("unavailable")}
          </div>
        )}
      </div>
    </GuestShell>
  );
}
