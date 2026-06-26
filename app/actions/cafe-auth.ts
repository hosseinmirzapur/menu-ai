"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

const CAFE_SESSION_COOKIE = "cafe_session";

export async function cafeLogin(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const slug = formData.get("slug") as string;
  const password = formData.get("password") as string;

  if (!slug || !password) {
    return { error: "لطفاً شناسه و رمز عبور را وارد کنید." };
  }

  try {
    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) {
      return { error: "رستورانی با این شناسه یافت نشد." };
    }

    const stored = restaurant.cafePassword;
    const valid = stored ? await verifyPassword(password, stored) : false;
    if (!valid) {
      return { error: "رمز عبور اشتباه است." };
    }

    const cookieStore = cookies();
    cookieStore.set(CAFE_SESSION_COOKIE, slug, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
      path: "/",
    });
  } catch {
    return { error: "خطا در ورود به سیستم." };
  }

  redirect("/cafe/dashboard");
}

export async function cafeLogout() {
  const cookieStore = cookies();
  cookieStore.delete(CAFE_SESSION_COOKIE);
  redirect("/cafe/login");
}

export async function getCafeSession(): Promise<string | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(CAFE_SESSION_COOKIE);
  return session?.value || null;
}
