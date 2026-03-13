import Link from "next/link";
import { QuickAddButton } from "@/components/order/quick-add-button";

function AbvLevel({ level }: { level: number }) {
  return (
    <span className="tracking-wider">
      <span className="text-text-muted text-[10px] mr-1">烈度</span>
      {"🔥".repeat(level)}
    </span>
  );
}

type MenuItem = {
  id: string;
  available: boolean;
  isSpecial: boolean;
  recipe: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    flavor: string | null;
    abv: number | null;
    price: number | null;
  };
};

export function MenuContent({
  eventId,
  menuItems,
  unavailableLabel,
  showQuickAdd,
}: {
  eventId: string;
  menuItems: MenuItem[];
  unavailableLabel: string;
  showQuickAdd?: boolean;
}) {
  const specials = menuItems.filter((item) => item.isSpecial);
  const regularItems = menuItems.filter((item) => !item.isSpecial);

  const grouped = new Map<string, MenuItem[]>();
  for (const item of regularItems) {
    const category = item.recipe.flavor || "其他";
    const list = grouped.get(category) || [];
    list.push(item);
    grouped.set(category, list);
  }

  const categories = [...grouped.keys()];
  let globalIndex = 0;

  return (
    <div className="space-y-10">
      {specials.length > 0 && (
        <div className="space-y-8">
          <div className="divider my-4">
            <span className="font-heading text-lg text-accent-gold tracking-wider">
              Today&apos;s Special
            </span>
          </div>

          {specials.map((item) => {
            const isSoldOut = !item.available;
            return (
              <div key={item.id} className="animate-fade-up">
                <Link
                  href={`/menu/${eventId}/${item.id}`}
                  className={`block ${isSoldOut ? "opacity-40 grayscale" : ""}`}
                >
                  {item.recipe.imageUrl ? (
                    <div className="w-full aspect-square rounded-lg overflow-hidden">
                      <img
                        src={item.recipe.imageUrl}
                        alt={item.recipe.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-border-gold/10 flex items-center justify-center">
                      <span className="text-5xl text-text-muted/30">🍸</span>
                    </div>
                  )}
                </Link>
                <div className={`mt-3 ${isSoldOut ? "opacity-60" : ""}`}>
                  <Link href={`/menu/${eventId}/${item.id}`}>
                    <h2 className={`font-heading text-xl font-semibold ${isSoldOut ? "text-text-muted" : "text-accent-gold"}`}>
                      {item.recipe.name}
                    </h2>
                  </Link>
                  {item.recipe.description && (
                    <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                      {item.recipe.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    {item.recipe.abv != null && (
                      <AbvLevel level={item.recipe.abv} />
                    )}
                    {item.recipe.price != null && (
                      <span className="text-accent-gold">
                        <span className="line-through opacity-50">${item.recipe.price}</span>
                        <span className="ml-1 font-bold">$0</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {isSoldOut ? (
                      <span className="text-xs text-accent-burgundy">
                        {unavailableLabel}
                      </span>
                    ) : showQuickAdd !== false ? (
                      <QuickAddButton
                        menuItemId={item.id}
                        name={item.recipe.name}
                        eventId={eventId}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

              const imageBlock = (
                <Link
                  href={`/menu/${eventId}/${item.id}`}
                  className={`block w-2/5 flex-shrink-0 ${isSoldOut ? "opacity-40 grayscale" : ""}`}
                >
                  {item.recipe.imageUrl ? (
                    <div className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={item.recipe.imageUrl}
                        alt={item.recipe.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
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
                      <AbvLevel level={item.recipe.abv} />
                    )}
                    {item.recipe.price != null && (
                      <span className="text-accent-gold">
                        <span className="line-through opacity-50">${item.recipe.price}</span>
                        <span className="ml-1 font-bold">$0</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {isSoldOut ? (
                      <span className="text-xs text-accent-burgundy">
                        {unavailableLabel}
                      </span>
                    ) : showQuickAdd !== false ? (
                      <QuickAddButton
                        menuItemId={item.id}
                        name={item.recipe.name}
                        eventId={eventId}
                      />
                    ) : null}
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
  );
}
