import { NextRequest, NextResponse } from "next/server";
import { getDbMenuItems, saveDbMenuItems } from "@/lib/db";
import { menuItems as defaultItems } from "@/lib/menu";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nameEn, nameFa, price, category } = body;

    if (!nameFa || !nameEn || !price || !category) {
      return NextResponse.json(
        { error: "nameFa, nameEn, price, and category are required" },
        { status: 400 }
      );
    }

    const dbItems = await getDbMenuItems();
    const current = dbItems.length > 0 ? dbItems : defaultItems;
    const index = current.findIndex((i) => i.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "آیتم یافت نشد" },
        { status: 404 }
      );
    }

    current[index] = { ...current[index], nameEn, nameFa, price, category };
    await saveDbMenuItems(current);

    return NextResponse.json({ item: current[index] });
  } catch (error) {
    console.error("PUT /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی آیتم" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbItems = await getDbMenuItems();
    const current = dbItems.length > 0 ? dbItems : defaultItems;
    const filtered = current.filter((i) => i.id !== params.id);

    if (filtered.length === current.length) {
      return NextResponse.json(
        { error: "آیتم یافت نشد" },
        { status: 404 }
      );
    }

    await saveDbMenuItems(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}
