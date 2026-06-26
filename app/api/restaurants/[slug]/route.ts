import { NextRequest, NextResponse } from "next/server";
import { getRestaurantBySlug, updateRestaurant, getDbMenuItems, getOrders } from "@/lib/db";
import { hashPassword, stripSensitive } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: "رستوران یافت نشد" }, { status: 404 });
    }

    const [menuItems, orders] = await Promise.all([
      getDbMenuItems(restaurant.id),
      getOrders(restaurant.id),
    ]);

    return NextResponse.json({ restaurant: stripSensitive(restaurant), menuItems, orders });
  } catch (error) {
    console.error("GET /api/restaurants/[slug] error:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات رستوران" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: "رستوران یافت نشد" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.nameFa !== undefined) updates.nameFa = body.nameFa;
    if (body.nameEn !== undefined) updates.nameEn = body.nameEn;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.descriptionFa !== undefined) updates.descriptionFa = body.descriptionFa;
    if (body.descriptionEn !== undefined) updates.descriptionEn = body.descriptionEn;
    if (body.themeConfig !== undefined) updates.themeConfig = body.themeConfig;
    if (body.businessHours !== undefined) updates.businessHours = body.businessHours;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.cafePassword !== undefined && body.cafePassword !== "") updates.cafePassword = body.cafePassword;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const updated = await updateRestaurant(restaurant.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "خطا در بروزرسانی" }, { status: 500 });
    }

    return NextResponse.json({ restaurant: stripSensitive(updated) });
  } catch (error) {
    console.error("PUT /api/restaurants/[slug] error:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی رستوران" }, { status: 500 });
  }
}
