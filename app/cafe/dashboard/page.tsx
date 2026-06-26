"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cafeLogout } from "@/actions/cafe-auth";
import AdminTable from "@/components/AdminTable";
import AdminMenuManager from "@/components/AdminMenuManager";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { motion } from "framer-motion";
import { Coffee, Palette, Store, LogOut, Globe } from "lucide-react";

type Tab = "orders" | "menu" | "theme";

interface RestaurantInfo {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  themeConfig: Record<string, string>;
  phone: string;
}

export default function CafeDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);

  const fetchRestaurant = useCallback(async () => {
    try {
      const res = await fetch("/api/cafe/session");
      if (!res.ok) {
        router.push("/cafe/login");
        return;
      }
      const data = await res.json();
      if (!data.restaurant) {
        router.push("/cafe/login");
        return;
      }
      setRestaurant(data.restaurant);
    } catch {
      router.push("/cafe/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleThemeSave = async (config: Record<string, string>) => {
    if (!restaurant) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurant.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeConfig: config }),
      });
      if (res.ok) {
        setRestaurant((prev) => prev ? { ...prev, themeConfig: config } : prev);
        setThemeOpen(false);
      }
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>در حال بارگذاری...</div>
      </main>
    );
  }

  if (!restaurant) return null;

  const cafeSlug = restaurant.slug;
  const subdomainUrl = `https://${cafeSlug}.menuchat.vercel.app`;

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="border rounded-2xl p-4 md:p-6 mb-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(196,168,138,0.1)" }}>
                <Store size={20} className="text-[#C4A88A]" />
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
                >
                  {restaurant.nameFa}
                </h1>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {restaurant.nameEn} · {restaurant.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <form action={cafeLogout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-colors"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
                >
                  <LogOut size={14} />
                  خروج
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
              <Globe size={12} />
              <span dir="ltr">{subdomainUrl}</span>
            </div>
            <a
              href={subdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
              style={{ color: "#C4A88A", backgroundColor: "rgba(196,168,138,0.1)" }}
            >
              مشاهده سایت
            </a>
          </div>
        </div>

        <div className="flex gap-1 mb-4 border rounded-xl p-1 w-fit"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "orders" ? "bg-[#C4A88A] text-[#0C0A09]" : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            سفارش‌ها
          </button>
          <button
            onClick={() => setTab("menu")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "menu" ? "bg-[#C4A88A] text-[#0C0A09]" : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            مدیریت منو
          </button>
          <button
            onClick={() => setTab("theme")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "theme" ? "bg-[#C4A88A] text-[#0C0A09]" : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            شخصی‌سازی
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 border rounded-2xl p-4 md:p-6 overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            {tab === "orders" && <AdminTable restaurantId={restaurant.id} />}
            {tab === "menu" && <AdminMenuManager restaurantId={restaurant.id} />}
            {tab === "theme" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    شخصی‌سازی ظاهر کافه
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    تم رنگی و ظاهر سایت کافه خود را سفارشی کنید.
                  </p>
                </div>
                <button
                  onClick={() => setThemeOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-colors w-full"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border-subtle)" }}
                >
                  <Palette size={16} className="text-[#C4A88A]" />
                  <span>ویرایش تم رنگی</span>
                </button>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(restaurant.themeConfig).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                      style={{ backgroundColor: "var(--bg-elevated)" }}
                    >
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: value, borderColor: "var(--border-subtle)" }} />
                      <span style={{ color: "var(--text-muted)" }}>{key.replace("--", "")}</span>
                      <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {themeOpen && restaurant && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setThemeOpen(false)}>
          <ThemeCustomizer
            initialConfig={restaurant.themeConfig}
            onSave={handleThemeSave}
            onClose={() => setThemeOpen(false)}
          />
        </div>
      )}
    </main>
  );
}
