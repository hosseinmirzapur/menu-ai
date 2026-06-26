"use client";

import { useState, useEffect } from "react";
import { adminLogout } from "@/actions/index";
import AdminTable from "@/components/AdminTable";
import AdminMenuManager from "@/components/AdminMenuManager";
import RestaurantManager from "@/components/RestaurantManager";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Store, Globe, Coffee, TrendingUp, Users } from "lucide-react";

type Tab = "overview" | "orders" | "menu" | "restaurants";

interface RestaurantInfo {
  id: string;
  nameFa: string;
  nameEn: string;
  slug: string;
  phone: string;
  isActive: boolean;
}

interface OrderSummary {
  id: string;
  restaurantId: string;
  status: string;
  totalAmount: number;
  timestamp: number;
}

export default function AdminDashboardClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | undefined>();
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState<string>("berlin-kontor");
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.restaurants || []) as RestaurantInfo[];
        setRestaurants(list);
        if (list.length > 0 && !selectedRestaurantId) {
          setSelectedRestaurantId(list[0].id);
        }
      })
      .catch(console.error);
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (tab === "overview") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setAllOrders(data.orders || []))
        .catch(console.error);
    }
  }, [tab]);

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  const displayName = currentRestaurant?.nameFa || "کافه دیجیتال";

  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const todayOrders = allOrders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.timestamp);
    return orderDate.toDateString() === today.toDateString();
  }).length;
  const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("fa-IR").format(p) + " تومان";

  const renderContent = () => {
    if (tab === "overview") {
      return (
        <div className="space-y-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            داشبورد مدیریت
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border rounded-xl p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Store size={16} className="text-[#C4A88A]" />
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>رستوران‌ها</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{restaurants.length}</span>
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Coffee size={16} className="text-[#C4A88A]" />
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>سفارش‌های امروز</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{todayOrders}</span>
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#C4A88A]" />
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>درآمد کل</span>
              </div>
              <span className="text-lg font-bold font-sans" style={{ color: "var(--text-primary)" }}>{formatPrice(totalRevenue)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "#C4A88A" }}>
              <Users size={14} className="inline mr-1" />
              رستوران‌ها
            </h3>
            <div className="grid gap-2">
              {restaurants.map((r) => {
                const orderCount = allOrders.filter((o) => o.restaurantId === r.id).length;
                const subdomainUrl = `https://${r.slug}.menuchat.vercel.app`;
                return (
                  <div
                    key={r.id}
                    className="border rounded-xl p-3 flex items-center justify-between"
                    style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-elevated)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(196,168,138,0.1)" }}>
                        <Store size={14} className="text-[#C4A88A]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {r.nameFa}
                        </div>
                        <div className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>
                          {r.slug} · {orderCount} سفارش
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={subdomainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                        style={{ color: "#C4A88A", backgroundColor: "rgba(196,168,138,0.1)" }}
                      >
                        <Globe size={12} />
                        سایت
                      </a>
                      <a
                        href={`/cafe/login`}
                        className="text-xs px-2 py-1 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-surface)" }}
                      >
                        پنل
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (tab === "orders") {
      return <AdminTable restaurantId={selectedRestaurantId} />;
    }

    if (tab === "menu") {
      return <AdminMenuManager restaurantId={selectedRestaurantId} />;
    }

    if (tab === "restaurants") {
      return <RestaurantManager />;
    }

    return null;
  };

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="border rounded-2xl p-4 md:p-6 mb-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
              >
                پنل مدیریت
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {tab === "overview" ? "نمای کلی همه رستوران‌ها" : `مدیریت ${displayName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/cafe/login"
                className="px-3 py-2 rounded-xl text-xs font-bold border transition-colors"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", backgroundColor: "var(--bg-elevated)" }}
              >
                ورود به پنل کافه
              </a>
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
                >
                  خروج
                </button>
              </form>
            </div>
          </div>

          {restaurants.length > 1 && tab !== "overview" && tab !== "restaurants" && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRestaurantId(r.id);
                    setSelectedRestaurantSlug(r.slug);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedRestaurantId === r.id
                      ? "bg-[#C4A88A] text-[#0C0A09]"
                      : "text-[#8B7355] hover:text-[#C4A88A]"
                  }`}
                  style={selectedRestaurantId !== r.id ? { backgroundColor: "var(--bg-elevated)" } : {}}
                >
                  {r.nameFa}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 mb-4 border rounded-xl p-1 w-fit"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setTab("overview")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "overview"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            نمای کلی
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "orders"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            سفارش‌ها
          </button>
          <button
            onClick={() => setTab("menu")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "menu"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            مدیریت منو
          </button>
          <button
            onClick={() => setTab("restaurants")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "restaurants"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            رستوران‌ها
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 border rounded-2xl p-4 md:p-6 overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            {renderContent()}
          </div>
          <div className="border rounded-2xl p-4 md:p-6 flex flex-col items-center"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: "#C4A88A" }}>
              اسکن کنید
            </h2>
            <QRCodeDisplay />
          </div>
        </div>
      </div>
    </main>
  );
}
