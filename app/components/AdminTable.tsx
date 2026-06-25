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
  status: "pending" | "preparing" | "ready" | "served";
  timestamp: number;
}

const STATUS_MAP: Record<string, string> = {
  pending: "در انتظار",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  served: "تحویل شده",
};

const STATUS_VARIANT: Record<string, "secondary" | "default" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "outline",
  served: "outline",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
};

export default function AdminTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("آیا از حذف این سفارش اطمینان دارید؟")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
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

  if (loading) {
    return (
      <div className="text-center py-12 text-[#8B7355]">
        در حال بارگذاری...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Coffee size={32} className="mx-auto mb-3 text-[#3D352D]" />
        <p className="text-[#8B7355]">هیچ سفارشی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#3D352D] text-[#C4A88A]">
            <th className="text-right py-3 px-2 font-semibold">زمان</th>
            <th className="text-right py-3 px-2 font-semibold">میز</th>
            <th className="text-right py-3 px-2 font-semibold">موبایل</th>
            <th className="text-right py-3 px-2 font-semibold">آیتم‌ها</th>
            <th className="text-right py-3 px-2 font-semibold">وضعیت</th>
            <th className="text-center py-3 px-2 font-semibold">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-[#3D352D]/50 hover:bg-[#292524]/50 transition-colors"
            >
              <td className="py-3 px-2 text-[#8B7355] text-xs whitespace-nowrap font-sans" dir="ltr">
                {formatTime(order.timestamp)}
              </td>
              <td className="py-3 px-2 font-bold text-[#EDE4D8]">
                {order.table}
              </td>
              <td className="py-3 px-2 text-[#8B7355] font-sans" dir="ltr">
                {order.phone}
              </td>
              <td className="py-3 px-2">
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-xs text-[#8B7355]">
                      {item.name}{" "}
                      <span className="text-[#3D352D]">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="py-3 px-2">
                <Badge variant={STATUS_VARIANT[order.status]} className="text-xs">
                  {STATUS_MAP[order.status]}
                </Badge>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-center gap-1">
                  {order.status !== "served" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStatus(order.id, NEXT_STATUS[order.status])
                      }
                      className="text-xs h-7 px-2 border-[#3D352D] text-[#C4A88A] hover:bg-[#C4A88A]/10"
                    >
                      {STATUS_MAP[NEXT_STATUS[order.status]]}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteOrder(order.id)}
                    className="text-xs h-7 px-2 border-[#3D352D] text-[#9F391B] hover:bg-[#9F391B]/10"
                  >
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
