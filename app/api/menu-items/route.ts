import { NextRequest, NextResponse } from "next/server";
import { getDbMenuItems, saveDbMenuItems } from "@/lib/db";
import type { DbMenuItem } from "@/lib/db";
import { menuItems as defaultItems } from "@/lib/menu";

export async function GET() {
  try {
    const dbItems = await getDbMenuItems();
    const items = dbItems.length > 0 ? dbItems : defaultItems;
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
    const { items } = body;

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

    await saveDbMenuItems(items as DbMenuItem[]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/menu-items error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره منو" },
      { status: 500 }
    );
  }
}
