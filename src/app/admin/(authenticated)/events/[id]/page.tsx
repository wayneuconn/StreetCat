import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEvent } from "@/lib/queries/events";
import { getAllRecipes } from "@/lib/queries/recipes";
import { getEventOrders } from "@/lib/queries/orders";
import { calculateShoppingList } from "@/lib/shopping";
import {
  updateEvent,
  toggleEventActive,
  addMenuItem,
  removeMenuItem,
  toggleMenuItemAvailable,
  toggleMenuItemSpecial,
} from "@/lib/actions/events";
import Link from "next/link";
import { ShoppingListTable } from "@/components/event/shopping-list-table";
import { OrderHistoryTable } from "@/components/event/order-history-table";
import { EventAdminTabs } from "@/components/event/event-admin-tabs";
import { ShareQR } from "@/components/share-qr";

export default async function EventEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.events");
  const tc = await getTranslations("common");

  const event = await getEvent(id);
  if (!event) notFound();

  const allRecipes = await getAllRecipes();
  const shoppingList = await calculateShoppingList(id);
  const eventOrders = await getEventOrders(id);
  const tq = await getTranslations("admin.queue");
  const to = await getTranslations("order.status");

  // Recipes not already on the menu
  const menuRecipeIds = new Set(event.menuItems.map((m) => m.recipeId));
  const availableRecipes = allRecipes.filter((r) => !menuRecipeIds.has(r.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-accent-gold">
            {t("editEvent")}
          </h1>
          <ShareQR eventId={event.id} eventName={event.name} />
        </div>
        <Link
          href="/admin/events"
          className="text-sm text-text-muted hover:text-accent-gold transition-colors"
        >
          {tc("back")}
        </Link>
      </div>

      <EventAdminTabs eventId={event.id} manageContent={
        <div className="space-y-6">

      {/* Event details */}
      <form action={updateEvent} className="card space-y-4">
        <input type="hidden" name="id" value={event.id} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("name")}
            </label>
            <input
              name="name"
              required
              defaultValue={event.name}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("date")}
            </label>
            <input
              name="date"
              type="date"
              required
              defaultValue={
                new Date(event.date).toISOString().split("T")[0]
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("expectedGuests")}
            </label>
            <input
              name="expectedGuests"
              type="number"
              min="1"
              defaultValue={event.expectedGuests}
              className="input"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary text-sm">
          {tc("save")}
        </button>
      </form>
      <form action={toggleEventActive} className="-mt-2">
        <input type="hidden" name="id" value={event.id} />
        <input
          type="hidden"
          name="isActive"
          value={String(event.isActive)}
        />
        <button
          type="submit"
          className={`text-sm ${
            event.isActive ? "btn-danger" : "btn-secondary"
          }`}
        >
          {event.isActive ? "Deactivate" : "Activate"}
        </button>
      </form>

      {/* Menu builder */}
      <div className="card space-y-4">
        <h3 className="font-heading text-lg text-accent-gold">
          {t("menuBuilder")}
        </h3>

        {event.menuItems.length > 0 && (
          <div className="space-y-2">
            {event.menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-border-gold"
              >
                <span
                  className={
                    item.available
                      ? "text-text-primary"
                      : "text-text-muted line-through"
                  }
                >
                  {item.recipe.name}
                </span>
                <div className="flex items-center gap-2">
                  <form action={toggleMenuItemSpecial}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="eventId"
                      value={event.id}
                    />
                    <input
                      type="hidden"
                      name="isSpecial"
                      value={String(item.isSpecial)}
                    />
                    <button
                      type="submit"
                      className={`badge text-xs ${
                        item.isSpecial ? "badge-making" : "badge-pending"
                      }`}
                    >
                      {item.isSpecial ? "★ Special" : "☆"}
                    </button>
                  </form>
                  <form action={toggleMenuItemAvailable}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="eventId"
                      value={event.id}
                    />
                    <input
                      type="hidden"
                      name="available"
                      value={String(item.available)}
                    />
                    <button
                      type="submit"
                      className={`badge text-xs ${
                        item.available ? "badge-ready" : "badge-picked_up"
                      }`}
                    >
                      {item.available ? "ON" : "86'd"}
                    </button>
                  </form>
                  <form action={removeMenuItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="eventId"
                      value={event.id}
                    />
                    <button
                      type="submit"
                      className="text-xs text-text-muted hover:text-accent-burgundy transition-colors"
                    >
                      {tc("delete")}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableRecipes.length > 0 && (
          <form action={addMenuItem} className="flex gap-3 items-end">
            <input type="hidden" name="eventId" value={event.id} />
            <div className="flex-1">
              <select name="recipeId" required className="input">
                <option value="">{t("addToMenu")}</option>
                {availableRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary text-sm">
              {tc("add")}
            </button>
          </form>
        )}
      </div>

      {/* Shopping list */}
      <div className="card space-y-4">
        <h3 className="font-heading text-lg text-accent-gold">
          {t("shoppingList")}
        </h3>
        <ShoppingListTable
          items={shoppingList}
          labels={{
            item: tc("noResults") === "No results" ? "Item" : "原料",
            needed: t("needed"),
            onHand: t("onHand"),
            toBuy: t("toBuy"),
            empty: t("shoppingListEmpty"),
            showAll: t("showAll"),
            showToBuy: t("showToBuy"),
          }}
        />
      </div>

      {/* Order history */}
      <div className="card space-y-4">
        <h3 className="font-heading text-lg text-accent-gold">
          {t("orderHistory")}
          <span className="text-sm text-text-muted font-normal ml-2">
            ({eventOrders.length})
          </span>
        </h3>
        <OrderHistoryTable
          orders={eventOrders.map((o) => ({
            id: o.id,
            guestName: o.guestName,
            status: o.status,
            createdAt: o.createdAt.toISOString(),
            items: o.items.map((i) => ({
              name: i.menuItem.recipe.name,
              quantity: i.quantity,
            })),
          }))}
          labels={{
            empty: t("orderHistoryEmpty"),
            guest: tq("guest"),
            pending: to("pending"),
            making: to("making"),
            ready: to("ready"),
            picked_up: to("picked_up"),
          }}
        />
      </div>
        </div>
      } />
    </div>
  );
}
