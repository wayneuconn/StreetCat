import {
  pgTable,
  text,
  real,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const ingredientCategory = pgEnum("ingredient_category", [
  "spirit",
  "mixer",
  "garnish",
  "bitter",
  "other",
]);

export const unitEnum = pgEnum("unit", [
  "oz",
  "ml",
  "dash",
  "piece",
  "bottle",
]);

export const glassType = pgEnum("glass_type", [
  "rocks",
  "coupe",
  "highball",
  "collins",
  "flute",
  "nick-nora",
]);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "making",
  "ready",
  "picked_up",
]);

// --- Tables ---

export const ingredients = pgTable("ingredients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  category: ingredientCategory("category").notNull().default("other"),
  quantityOnHand: real("quantity_on_hand").notNull().default(0),
  unit: unitEnum("unit").notNull().default("oz"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  glassType: glassType("glass_type").default("rocks"),
  garnish: text("garnish"),
  imageUrl: text("image_url"),
  baseSpirit: text("base_spirit"),
  flavor: text("flavor"),
  characteristics: text("characteristics"),
  abv: real("abv"),
  price: real("price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  unit: unitEnum("unit").notNull().default("oz"),
});

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  expectedGuests: integer("expected_guests").notNull().default(10),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventMenuItems = pgTable("event_menu_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  available: boolean("available").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  status: orderStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => eventMenuItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
});

// --- Relations ---

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
}));

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  eventMenuItems: many(eventMenuItems),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  })
);

export const eventsRelations = relations(events, ({ many }) => ({
  menuItems: many(eventMenuItems),
  orders: many(orders),
}));

export const eventMenuItemsRelations = relations(
  eventMenuItems,
  ({ one, many }) => ({
    event: one(events, {
      fields: [eventMenuItems.eventId],
      references: [events.id],
    }),
    recipe: one(recipes, {
      fields: [eventMenuItems.recipeId],
      references: [recipes.id],
    }),
    orderItems: many(orderItems),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  event: one(events, {
    fields: [orders.eventId],
    references: [events.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(eventMenuItems, {
    fields: [orderItems.menuItemId],
    references: [eventMenuItems.id],
  }),
}));

// --- Types ---
export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventMenuItem = typeof eventMenuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
