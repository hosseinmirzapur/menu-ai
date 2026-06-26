import { NextRequest, NextResponse } from "next/server";
import { getCafeSession } from "@/actions/cafe-auth";
import { getRestaurantBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const slug = await getCafeSession();
    if (!slug) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        slug: restaurant.slug,
        nameFa: restaurant.nameFa,
        nameEn: restaurant.nameEn,
        descriptionFa: restaurant.descriptionFa,
        descriptionEn: restaurant.descriptionEn,
        themeConfig: restaurant.themeConfig,
        phone: restaurant.phone,
      },
    });
  } catch (error) {
    console.error("GET /api/cafe/session error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
