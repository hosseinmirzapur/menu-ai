import { NextRequest, NextResponse } from "next/server";
import { getDbMenuItems, saveDbMenuItems } from "@/lib/db";
import type { DbMenuItem } from "@/lib/db";
import { getMenuItems } from "@/lib/menu";

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
    const restaurantSlug = request.nextUrl.searchParams.get("slug");

    const dbItems = await getDbMenuItems(restaurantId || undefined);
    const isDefault = !restaurantId || restaurantId === "rest_default";
    const items = dbItems.length > 0 ? dbItems : (isDefault && restaurantSlug ? getMenuItems(restaurantSlug) : []);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/menu-items error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت منو" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, restaurant_id } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.id || !item.nameFa || !item.nameEn || !item.price || !item.category) {
        return NextResponse.json(
          { error: "Each item must have id, nameFa, nameEn, price, and category" },
          { status: 400 }
        );
      }
    }

    const rid = restaurant_id || "rest_default";
    const dbItems: DbMenuItem[] = items.map((i: any) => ({
      id: i.id,
      restaurantId: rid,
      categoryId: i.categoryId || "",
      nameEn: i.nameEn,
      nameFa: i.nameFa,
      descriptionFa: i.descriptionFa || "",
      descriptionEn: i.descriptionEn || "",
      price: Number(i.price),
      cost: i.cost || 0,
      isAvailable: i.isAvailable !== false,
      isFeatured: i.isFeatured || false,
      sortOrder: i.sortOrder || 0,
      preparationTime: i.preparationTime || 0,
      dietaryTags: i.dietaryTags || [],
      createdAt: Date.now(),
    }));

    await saveDbMenuItems(rid, dbItems);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/menu-items error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره منو" },
      { status: 500 }
    );
  }
}
