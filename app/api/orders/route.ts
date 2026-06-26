import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
    const orders = await getOrders(restaurantId || undefined);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سفارش‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, table, phone, name, restaurant_id, order_type, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items must be a non-empty array" },
        { status: 400 }
      );
    }
    if (!table || !phone) {
      return NextResponse.json(
        { error: "table and phone are required" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      restaurantId: restaurant_id || "rest_default",
      items: items.map((i: any) => ({
        id: i.id || generateId(),
        menuItemId: i.menuItemId || i.id || "",
        nameFa: i.nameFa || i.name || "",
        nameEn: i.nameEn || "",
        price: i.price,
        quantity: i.quantity,
        notes: i.notes || "",
        totalPrice: (i.totalPrice || i.price * i.quantity),
      })),
      tableNumber: table,
      customerPhone: phone,
      customerName: name || "",
      orderType: order_type || "dine_in",
      notes: notes || "",
    });

    return NextResponse.json({ id: order.id, status: order.status });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سفارش" },
      { status: 500 }
    );
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
