"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events, eventMenuItems } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function createEvent(formData: FormData) {
  const [event] = await db
    .insert(events)
    .values({
      name: formData.get("name") as string,
      date: new Date(formData.get("date") as string),
      expectedGuests: parseInt(formData.get("expectedGuests") as string) || 10,
    })
    .returning();

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(formData: FormData) {
  const id = formData.get("id") as string;
  await db
    .update(events)
    .set({
      name: formData.get("name") as string,
      date: new Date(formData.get("date") as string),
      expectedGuests: parseInt(formData.get("expectedGuests") as string) || 10,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
}

export async function toggleEventActive(formData: FormData) {
  const id = formData.get("id") as string;
  const currentActive = formData.get("isActive") === "true";

  if (!currentActive) {
    // Deactivate all other events first
    await db
      .update(events)
      .set({ isActive: false, updatedAt: new Date() })
      .where(ne(events.id, id));
  }

  await db
    .update(events)
    .set({ isActive: !currentActive, updatedAt: new Date() })
    .where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/menu");
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get("id") as string;
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function addMenuItem(formData: FormData) {
  const eventId = formData.get("eventId") as string;
  const recipeId = formData.get("recipeId") as string;

  // Get max sort order
  const existing = await db.query.eventMenuItems.findMany({
    where: eq(eventMenuItems.eventId, eventId),
  });
  const maxSort = Math.max(0, ...existing.map((m) => m.sortOrder));

  await db.insert(eventMenuItems).values({
    eventId,
    recipeId,
    sortOrder: maxSort + 1,
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/menu");
}

export async function removeMenuItem(formData: FormData) {
  const id = formData.get("id") as string;
  const eventId = formData.get("eventId") as string;
  await db.delete(eventMenuItems).where(eq(eventMenuItems.id, id));
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/menu");
}

export async function toggleMenuItemAvailable(formData: FormData) {
  const id = formData.get("id") as string;
  const eventId = formData.get("eventId") as string;
  const currentAvailable = formData.get("available") === "true";

  await db
    .update(eventMenuItems)
    .set({ available: !currentAvailable })
    .where(eq(eventMenuItems.id, id));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/menu");
}
