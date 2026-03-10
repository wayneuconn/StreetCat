import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eventMenuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";

export default async function CocktailDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const t = await getTranslations("menu");

  const menuItem = await db.query.eventMenuItems.findFirst({
    where: eq(eventMenuItems.id, itemId),
    with: {
      recipe: true,
    },
  });

  if (!menuItem) notFound();

  const { recipe } = menuItem;

  return (
    <GuestShell>
      <div className="space-y-6">
        <Link
          href="/menu"
          className="text-sm text-text-muted hover:text-accent-gold transition-colors"
        >
          &larr; {t("title")}
        </Link>

        <div className="card animate-fade-up overflow-hidden">
          {recipe.imageUrl && (
            <div
              className="w-full aspect-[3/2] -mx-[1.25rem] -mt-[1.25rem] mb-4 overflow-hidden"
              style={{ width: "calc(100% + 2.5rem)" }}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
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

          <div className="grid grid-cols-2 gap-4 text-sm">
            {recipe.baseSpirit && (
              <div>
                <span className="text-text-muted">{t("baseSpirit")}</span>
                <p className="mt-0.5 text-text-primary">{recipe.baseSpirit}</p>
              </div>
            )}
            {recipe.flavor && (
              <div>
                <span className="text-text-muted">{t("flavor")}</span>
                <p className="mt-0.5 text-text-primary">{recipe.flavor}</p>
              </div>
            )}
            {recipe.abv != null && (
              <div>
                <span className="text-text-muted">{t("abv")}</span>
                <p className="mt-0.5 text-text-primary">{recipe.abv}%</p>
              </div>
            )}
          </div>

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

        {menuItem.available && (
          <div className="text-center">
            <Link href="/order" className="btn-primary inline-block">
              {t("orderThis")}
            </Link>
          </div>
        )}
      </div>
    </GuestShell>
  );
}
