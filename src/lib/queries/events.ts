import { db } from "@/lib/db";
import { events, eventMenuItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllEvents() {
  return db.query.events.findMany({
    orderBy: [desc(events.date)],
  });
}

export async function getEvent(id: string) {
  return db.query.events.findFirst({
    where: eq(events.id, id),
    with: {
      menuItems: {
        with: {
          recipe: true,
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
