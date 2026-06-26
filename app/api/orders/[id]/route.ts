import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, deleteOrder } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, restaurant_id } = body;

    const validStatuses = ["pending", "confirmed", "preparing", "ready", "served", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, confirmed, preparing, ready, served, or cancelled" },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(params.id, status, restaurant_id || undefined);
    if (!order) {
      return NextResponse.json(
        { error: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی سفارش" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurant_id") || undefined;
    const deleted = await deleteOrder(params.id, restaurantId);
    if (!deleted) {
      return NextResponse.json(
        { error: "سفارش یافت نشد" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در حذف سفارش" },
      { status: 500 }
    );
  }
}
