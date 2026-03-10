"use server";

import { redirect } from "next/navigation";
import { verifyPassword, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password required" };
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return { error: "Wrong password" };
  }

  await setAuthCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/admin/login");
}
