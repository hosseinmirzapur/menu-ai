import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories, deleteCategory } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nameFa, nameEn, restaurant_id } = body;

    if (!nameFa || !nameEn) {
      return NextResponse.json(
        { error: "nameFa and nameEn are required" },
        { status: 400 }
      );
    }

    const rid = restaurant_id || "rest_default";
    const categories = await getCategories(rid);
    const index = categories.findIndex((c) => c.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    categories[index] = {
      ...categories[index],
      nameFa,
      nameEn,
    };
    await saveCategories(rid, categories);

    return NextResponse.json({ category: categories[index] });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی دسته‌بندی" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurant_id") || "rest_default";
    const deleted = await deleteCategory(restaurantId, params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    );
  }
}
