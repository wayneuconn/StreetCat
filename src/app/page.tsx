import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const activeEvent = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  if (activeEvent) {
    redirect("/menu");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="animate-fade-up">
        <CatLogo className="mx-auto mb-6 h-24 w-24 text-accent-gold" />
        <h1 className="font-heading text-4xl font-bold text-accent-gold">
          街猫酒吧
        </h1>
        <p className="mt-2 text-text-secondary">StreetCat Bar</p>
        <div className="divider my-8">
          <span className="text-text-muted text-sm">~ ~ ~</span>
        </div>
        <p className="text-text-muted">暂无进行中的活动</p>
      </div>
    </div>
  );
}

function CatLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 75 C25 45, 35 25, 50 20 C65 25, 75 45, 75 75"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M30 45 L25 20 L40 35"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M70 45 L75 20 L60 35"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="40" cy="48" r="2.5" fill="currentColor" />
      <circle cx="60" cy="48" r="2.5" fill="currentColor" />
      <path
        d="M46 55 Q50 58 54 55"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M30 52 L18 50"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M30 55 L18 56"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M70 52 L82 50"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M70 55 L82 56"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M75 75 Q78 82, 85 80"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
