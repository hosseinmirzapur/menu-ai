"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, X, Store, Palette, Clock, MapPin, Key, Eye, EyeOff, Globe } from "lucide-react";
import BusinessHoursEditor from "./BusinessHoursEditor";
import ThemeCustomizer from "./ThemeCustomizer";

interface RestaurantData {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  themeConfig: Record<string, string>;
  businessHours: Record<string, { open: string; close: string }>;
  phone: string;
  address: { text: string; lat?: number; lng?: number };
  cafePassword: string;
  isActive: boolean;
}

const DEFAULT_THEME: Record<string, string> = {
  "--bg-base": "#0C0A09",
  "--bg-surface": "#1C1917",
  "--bg-elevated": "#292524",
  "--border-subtle": "#3D352D",
  "--text-primary": "#EDE4D8",
  "--text-secondary": "#C4A88A",
  "--text-muted": "#8B7355",
  "--danger": "#9F391B",
  "--success": "#5A7A5A",
};

const DEFAULT_HOURS: Record<string, { open: string; close: string }> = {
  sat: { open: "09:00", close: "22:00" },
  sun: { open: "09:00", close: "22:00" },
  mon: { open: "09:00", close: "22:00" },
  tue: { open: "09:00", close: "22:00" },
  wed: { open: "09:00", close: "22:00" },
  thu: { open: "09:00", close: "22:00" },
  fri: { open: "10:00", close: "21:00" },
};

export default function RestaurantManager() {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    nameFa: "",
    nameEn: "",
    descriptionFa: "",
    descriptionEn: "",
    phone: "",
    address: "",
    cafePassword: "",
    themeConfig: DEFAULT_THEME,
    businessHours: DEFAULT_HOURS,
    isActive: true,
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      setError("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      slug: "", nameFa: "", nameEn: "", descriptionFa: "", descriptionEn: "",
      phone: "", address: "", cafePassword: "",
      themeConfig: DEFAULT_THEME, businessHours: DEFAULT_HOURS, isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (r: RestaurantData) => {
    setEditing(r);
    setForm({
      slug: r.slug, nameFa: r.nameFa, nameEn: r.nameEn,
      descriptionFa: r.descriptionFa || "", descriptionEn: r.descriptionEn || "",
      phone: r.phone || "", address: r.address?.text || "",
      cafePassword: r.cafePassword || "",
      themeConfig: r.themeConfig || DEFAULT_THEME,
      businessHours: r.businessHours || DEFAULT_HOURS,
      isActive: r.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.nameFa.trim() || !form.nameEn.trim()) return;
    setError("");

    try {
      const body = {
        ...form,
        address: { text: form.address },
        businessHours: form.businessHours,
        themeConfig: form.themeConfig,
      };

      if (editing) {
        const res = await fetch(`/api/restaurants/${editing.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/restaurants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
      }

      setModalOpen(false);
      fetchRestaurants();
    } catch (err) {
      setError("خطا در ذخیره اطلاعات");
    }
  };

  const applyPreviewTheme = (config: Record<string, string>) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(config)) {
      root.style.setProperty(key, value);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
        >
          مدیریت رستوران‌ها
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-colors"
          style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
        >
          <Plus size={16} />
          افزودن رستوران
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm bg-[#9F391B]/10 text-[#9F391B] border border-[#9F391B]/20">
          {error}
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <Store size={32} className="mx-auto mb-3" style={{ color: "var(--border-subtle)" }} />
          <p style={{ color: "var(--text-muted)" }}>هیچ رستورانی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {restaurants.map((r) => {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
            const pathUrl = `${baseUrl}/restaurant/${r.slug}`;
            return (
              <div
                key={r.id}
                className="border rounded-xl p-4"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(196,168,138,0.1)" }}>
                      <Store size={18} className="text-[#C4A88A]" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {r.nameFa}
                        <span className="text-xs mr-2 font-normal" style={{ color: "var(--text-muted)" }}>
                          {r.nameEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>
                          {r.slug}
                        </span>
                        {r.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(90,122,90,0.15)", color: "#5A7A5A" }}>
                            فعال
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={pathUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      title={pathUrl}
                    >
                      <Globe size={14} />
                    </a>
                    <button
                      onClick={() => openEdit(r)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl shadow-black/30"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {editing ? "ویرایش رستوران" : "افزودن رستوران جدید"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="hover:text-[#C4A88A] transition-colors p-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#C4A88A" }}>
                      <Store size={14} />
                      اطلاعات اصلی
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                          شناسه (slug)
                        </label>
                        <input
                          value={form.slug}
                          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355] font-sans"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="my-cafe"
                          dir="ltr"
                        />
                        {editing && (
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                            برای تغییر slug از ویرایش مستقیم دیتابیس استفاده کنید
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                            نام فارسی
                          </label>
                          <input
                            value={form.nameFa}
                            onChange={(e) => setForm((f) => ({ ...f, nameFa: e.target.value }))}
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                            style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                            placeholder="کافه من"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                            نام انگلیسی
                          </label>
                          <input
                            value={form.nameEn}
                            onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none font-sans"
                            style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                            placeholder="My Cafe"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                          توضیحات (فارسی)
                        </label>
                        <input
                          value={form.descriptionFa}
                          onChange={(e) => setForm((f) => ({ ...f, descriptionFa: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="کافه‌ای دنج و مدرن"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                          توضیحات (انگلیسی)
                        </label>
                        <input
                          value={form.descriptionEn}
                          onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none font-sans"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="A cozy modern cafe"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#C4A88A" }}>
                      <MapPin size={14} />
                      اطلاعات تماس و موقعیت
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                          شماره تماس
                        </label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none font-sans"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                          آدرس
                        </label>
                        <input
                          value={form.address}
                          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="تهران، خیابان..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#C4A88A" }}>
                      <Clock size={14} />
                      ساعات کاری
                    </h4>
                    <BusinessHoursEditor
                      hours={form.businessHours}
                      onChange={(hours) => setForm((f) => ({ ...f, businessHours: hours }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#C4A88A" }}>
                      <Key size={14} />
                      دسترسی مدیر کافه
                    </h4>
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        رمز عبور پنل کافه
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.cafePassword}
                          onChange={(e) => setForm((f) => ({ ...f, cafePassword: e.target.value }))}
                          className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none font-sans ltr"
                          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                          placeholder="cafe123"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                        مدیر کافه با این رمز در {form.slug ? `cafe-blaze.menuchat.vercel.app/cafe/login` : "آدرس پنل کافه"} وارد می‌شود
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#C4A88A" }}>
                      <Palette size={14} />
                      تم رنگی
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(form.themeConfig).slice(0, 9).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: "var(--bg-elevated)" }}
                        >
                          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: value, borderColor: "var(--border-subtle)" }} />
                          <span className="font-mono" style={{ color: "var(--text-muted)" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setThemeOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors"
                      style={{ borderColor: "var(--border-subtle)", color: "#C4A88A" }}
                    >
                      <Palette size={14} />
                      ویرایش تم رنگی
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                    style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.slug.trim() || !form.nameFa.trim() || !form.nameEn.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                    style={{ backgroundColor: "#C4A88A", color: "#0C0A09" }}
                  >
                    {editing ? "ذخیره تغییرات" : "افزودن"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {themeOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60" onClick={() => setThemeOpen(false)}>
          <ThemeCustomizer
            initialConfig={form.themeConfig}
            onSave={(config) => {
              setForm((f) => ({ ...f, themeConfig: config }));
              setThemeOpen(false);
            }}
            onClose={() => setThemeOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
