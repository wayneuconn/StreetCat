import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";

export async function getOrder(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          menuItem: {
            with: {
              recipe: true,
            },
          },
        },
      },
    },
  });
}

export async function getEventOrders(eventId: string) {
  return db.query.orders.findMany({
    where: eq(orders.eventId, eventId),
    with: {
      items: {
        with: {
          menuItem: {
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
          },
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });
}

export async function getActiveOrders(eventId: string) {
  return db.query.orders.findMany({
    where: and(
      eq(orders.eventId, eventId),
      ne(orders.status, "picked_up")
    ),
    with: {
      items: {
        with: {
          menuItem: {
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
          },
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });
}
