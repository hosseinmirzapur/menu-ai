import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/db";
import type { MenuCategory } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
    if (!restaurantId) {
      return NextResponse.json({ categories: [] });
    }
    const categories = await getCategories(restaurantId);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, restaurant_id } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "categories must be an array" },
        { status: 400 }
      );
    }

    for (const cat of categories) {
      if (!cat.id || !cat.nameFa || !cat.nameEn) {
        return NextResponse.json(
          { error: "Each category must have id, nameFa, and nameEn" },
          { status: 400 }
        );
      }
    }

    const rid = restaurant_id || "rest_default";
    const dbCategories: MenuCategory[] = categories.map((c: any) => ({
      id: c.id,
      restaurantId: rid,
      nameFa: c.nameFa,
      nameEn: c.nameEn,
      sortOrder: c.sortOrder || 0,
      isActive: c.isActive !== false,
    }));

    await saveCategories(rid, dbCategories);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}
