"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface MenuFormData {
  id: string;
  nameFa: string;
  nameEn: string;
  price: string;
  category: string;
}

const emptyForm: MenuFormData = {
  id: "",
  nameFa: "",
  nameEn: "",
  price: "",
  category: "نوشیدنی گرم",
};

const CATEGORIES = ["نوشیدنی گرم", "نوشیدنی سرد", "دسر", "غذا", "پیش‌غذا"];

export default function AdminMenuManager({ restaurantId }: { restaurantId?: string }) {
  const [items, setItems] = useState<MenuFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const rid = restaurantId || "rest_default";

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("restaurant_id", rid);
      const res = await fetch(`/api/menu-items?${params}`);
      const data = await res.json();
      setItems(
        (data.items || []).map((i: any) => ({
          ...i,
          price: String(i.price),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setLoading(false);
    }
  }, [rid]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: MenuFormData) => {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameFa.trim() || !form.nameEn.trim() || !form.price.trim()) return;
    if (!editingId && !form.id.trim()) return;

    setSaving(true);
    try {
      const itemToSave = {
        id: editingId || form.id.trim(),
        nameFa: form.nameFa.trim(),
        nameEn: form.nameEn.trim(),
        price: Number(form.price),
        category: form.category,
      };

      if (editingId) {
        const res = await fetch(`/api/menu-items/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...itemToSave, restaurant_id: rid }),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const current = [...items, { ...itemToSave, price: String(itemToSave.price) }];
        const res = await fetch("/api/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: current.map((i) => ({ ...i, price: Number(i.price) })),
            restaurant_id: rid,
          }),
        });
        if (!res.ok) throw new Error("Failed to create");
      }

      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف "${name}" اطمینان دارید؟`)) return;
    try {
      const params = new URLSearchParams();
      params.set("restaurant_id", rid);
      const res = await fetch(`/api/menu-items/${id}?${params}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("fa-IR").format(Number(p)) + " تومان";

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
          مدیریت منو
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-colors"
          style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
        >
          <Plus size={16} />
          افزودن آیتم
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
              <th className="text-right py-3 px-2 font-semibold">نام</th>
              <th className="text-right py-3 px-2 font-semibold">English</th>
              <th className="text-right py-3 px-2 font-semibold">دسته</th>
              <th className="text-right py-3 px-2 font-semibold">قیمت</th>
              <th className="text-center py-3 px-2 font-semibold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-[#292524]/50 transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td className="py-3 px-2 font-bold" style={{ color: "var(--text-primary)" }}>
                  {item.nameFa}
                </td>
                <td className="py-3 px-2 text-xs font-sans" style={{ color: "var(--text-muted)" }}>
                  {item.nameEn}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "#C4A88A" }}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-2 font-bold font-sans text-xs" dir="ltr" style={{ color: "var(--text-secondary)" }}>
                  {formatPrice(item.price)}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.nameFa)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: "var(--text-muted)" }}>هیچ آیتمی در منو وجود ندارد.</p>
          </div>
        )}
      </div>

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
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="border rounded-2xl p-6 w-full max-w-md shadow-xl shadow-black/30"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {editingId ? "ویرایش آیتم" : "افزودن آیتم جدید"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="hover:text-[#C4A88A] transition-colors p-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        شناسه (slug)
                      </label>
                      <input
                        value={form.id}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, id: e.target.value }))
                        }
                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355] font-sans"
                        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                        placeholder="e.g. espresso"
                        dir="ltr"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        نام فارسی
                      </label>
                      <input
                        value={form.nameFa}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nameFa: e.target.value }))
                        }
                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355]"
                        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                        placeholder="اسپرسو"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        نام انگلیسی
                      </label>
                      <input
                        value={form.nameEn}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nameEn: e.target.value }))
                        }
                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355] font-sans"
                        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                        placeholder="Espresso"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        قیمت (تومان)
                      </label>
                      <input
                        value={form.price}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setForm((f) => ({ ...f, price: v }));
                        }}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355] font-sans"
                        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                        placeholder="150000"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                        دسته‌بندی
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
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
                    disabled={
                      saving ||
                      !form.nameFa.trim() ||
                      !form.nameEn.trim() ||
                      !form.price.trim() ||
                      (!editingId && !form.id.trim())
                    }
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                    style={{ backgroundColor: "#C4A88A", color: "#0C0A09" }}
                  >
                    {saving
                      ? "در حال ذخیره..."
                      : editingId
                      ? "ذخیره تغییرات"
                      : "افزودن"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
