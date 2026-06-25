"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "admin_session";
const SESSION_VALUE = "authenticated";
const SESSION_MAX_AGE = 60 * 60 * 4;

export async function adminLogin(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== adminPassword) {
    return { error: "رمز عبور اشتباه است." };
  }

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function adminLogout() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin");
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}
