import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GuestShell } from "@/components/layout/guest-shell";
import { getTranslations } from "next-intl/server";

export default async function MenuRedirectPage() {
  const t = await getTranslations("menu");

  const activeEvent = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  if (activeEvent) {
    redirect(`/menu/${activeEvent.id}`);
  }

  return (
    <GuestShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-text-muted text-lg">{t("noActiveEvent")}</p>
      </div>
    </GuestShell>
  );
}
