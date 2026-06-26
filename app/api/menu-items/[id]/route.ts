import { NextRequest, NextResponse } from "next/server";
import { getDbMenuItems, saveDbMenuItems, deleteDbMenuItem } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nameEn, nameFa, price, category, restaurant_id } = body;

    if (!nameFa || !nameEn || !price || !category) {
      return NextResponse.json(
        { error: "nameFa, nameEn, price, and category are required" },
        { status: 400 }
      );
    }

    const rid = restaurant_id || "rest_default";
    const dbItems = await getDbMenuItems(rid);
    const index = dbItems.findIndex((i) => i.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "آیتم یافت نشد" },
        { status: 404 }
      );
    }

    dbItems[index] = {
      ...dbItems[index],
      nameEn,
      nameFa,
      price: Number(price),
      categoryId: category,
    } as any;
    await saveDbMenuItems(rid, dbItems);

    return NextResponse.json({ item: dbItems[index] });
  } catch (error) {
    console.error("PUT /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی آیتم" },
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
    const deleted = await deleteDbMenuItem(restaurantId, params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "آیتم یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}
