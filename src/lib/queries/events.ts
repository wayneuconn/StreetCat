import { db } from "@/lib/db";
import { events, eventMenuItems, orders } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getAllEvents() {
  return db.query.events.findMany({
    orderBy: [desc(events.date)],
    with: {
      orders: {
        columns: { id: true },
      },
    },
  });
}

export async function getEvent(id: string) {
  return db.query.events.findFirst({
    where: eq(events.id, id),
    with: {
      menuItems: {
        with: {
          recipe: {
            with: {
              recipeIngredients: {
                with: {
                  ingredient: true,
                },
              },
            },
          },
        },
        orderBy: [eventMenuItems.sortOrder],
      },
    },
  });
}

export async function getActiveEvent() {
  return db.query.events.findFirst({
    where: eq(events.isActive, true),
    with: {
      menuItems: {
        with: {
          recipe: {
            with: {
              recipeIngredients: {
                with: {
                  ingredient: true,
                },
              },
            },
          },
        },
        orderBy: [eventMenuItems.sortOrder],
      },
    },
  });
}
