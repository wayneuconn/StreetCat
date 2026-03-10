"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, type Locale } from "@/i18n/config";

export async function switchLocaleAction() {
  const cookieStore = await cookies();
  const current = cookieStore.get("locale")?.value as Locale | undefined;
  const next = current === "en" ? "zh" : "en";

  cookieStore.set("locale", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}
