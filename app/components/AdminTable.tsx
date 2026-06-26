"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  table: string;
  phone: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";
  timestamp: number;
}

const STATUS_MAP: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تأیید شده",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  served: "تحویل شده",
  cancelled: "لغو شده",
};

const STATUS_VARIANT: Record<string, "secondary" | "default" | "outline"> = {
  pending: "secondary",
  confirmed: "secondary",
  preparing: "default",
  ready: "outline",
  served: "outline",
  cancelled: "outline",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
};

export default function AdminTable({ restaurantId }: { restaurantId?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.set("restaurant_id", restaurantId);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, restaurant_id: restaurantId }),
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("آیا از حذف این سفارش اطمینان دارید؟")) return;
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.set("restaurant_id", restaurantId);
      await fetch(`/api/orders/${id}?${params}`, { method: "DELETE" });
      fetchOrders();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("fa-IR").format(p) + " تومان";

  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        در حال بارگذاری...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Coffee size={32} className="mx-auto mb-3" style={{ color: "var(--border-subtle)" }} />
        <p style={{ color: "var(--text-muted)" }}>هیچ سفارشی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            <th className="text-right py-3 px-2 font-semibold">زمان</th>
            <th className="text-right py-3 px-2 font-semibold">میز</th>
            <th className="text-right py-3 px-2 font-semibold">موبایل</th>
            <th className="text-right py-3 px-2 font-semibold">آیتم‌ها</th>
            <th className="text-right py-3 px-2 font-semibold">قیمت</th>
            <th className="text-right py-3 px-2 font-semibold">وضعیت</th>
            <th className="text-center py-3 px-2 font-semibold">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <tr
                key={order.id}
                className="border-b hover:bg-[#292524]/50 transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td className="py-3 px-2 text-xs whitespace-nowrap font-sans" dir="ltr" style={{ color: "var(--text-muted)" }}>
                  {formatTime(order.timestamp)}
                </td>
                <td className="py-3 px-2 font-bold" style={{ color: "var(--text-primary)" }}>
                  {order.table}
                </td>
                <td className="py-3 px-2 font-sans" dir="ltr" style={{ color: "var(--text-muted)" }}>
                  {order.phone}
                </td>
                <td className="py-3 px-2">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.name}{" "}
                        <span style={{ color: "var(--border-subtle)" }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2 font-sans text-xs" style={{ color: "var(--text-secondary)" }}>
                  {formatPrice(total)}
                </td>
                <td className="py-3 px-2">
                  <Badge variant={STATUS_VARIANT[order.status] || "secondary"} className="text-xs">
                    {STATUS_MAP[order.status] || order.status}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {order.status !== "served" && order.status !== "cancelled" && NEXT_STATUS[order.status] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateStatus(order.id, NEXT_STATUS[order.status])
                        }
                        className="text-xs h-7 px-2"
                        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                      >
                        {STATUS_MAP[NEXT_STATUS[order.status]]}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                      className="text-xs h-7 px-2"
                      style={{ borderColor: "var(--border-subtle)", color: "#9F391B" }}
                    >
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
