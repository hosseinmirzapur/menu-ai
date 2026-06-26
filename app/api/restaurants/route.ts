import { NextRequest, NextResponse } from "next/server";
import { getRestaurants, createRestaurant } from "@/lib/db";
import { hashPassword, stripSensitive } from "@/lib/auth";

export async function GET() {
  try {
    const restaurants = await getRestaurants();
    return NextResponse.json({ restaurants: restaurants.map(stripSensitive) });
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json({ error: "خطا در دریافت رستوران‌ها" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, nameFa, nameEn } = body;

    if (!slug || !nameFa || !nameEn) {
      return NextResponse.json(
        { error: "slug, nameFa, and nameEn are required" },
        { status: 400 }
      );
    }

    const restaurant = await createRestaurant({
      slug,
      nameFa,
      nameEn,
      descriptionFa: body.descriptionFa || "",
      descriptionEn: body.descriptionEn || "",
      themeConfig: body.themeConfig || {},
      businessHours: body.businessHours || {},
      phone: body.phone || "",
      address: body.address || { text: "" },
      cafePassword: body.cafePassword || "cafe123",
      isActive: true,
    });

    return NextResponse.json({ restaurant: stripSensitive(restaurant) });
  } catch (error) {
    console.error("POST /api/restaurants error:", error);
    return NextResponse.json({ error: "خطا در ایجاد رستوران" }, { status: 500 });
  }
}
