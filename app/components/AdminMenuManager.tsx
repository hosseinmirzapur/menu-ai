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

export default function AdminMenuManager() {
  const [items, setItems] = useState<MenuFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/menu-items");
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
  }, []);

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
          body: JSON.stringify(itemToSave),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const current = [...items, { ...itemToSave, price: String(itemToSave.price) }];
        const res = await fetch("/api/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: current.map((i) => ({ ...i, price: Number(i.price) })),
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
      const res = await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
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
      <div className="text-center py-12 text-[#8B7355]">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold text-[#EDE4D8]"
          style={{
            fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui",
          }}
        >
          مدیریت منو
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C4A88A]/10 text-[#C4A88A] text-sm font-bold border border-[#C4A88A]/20 hover:bg-[#C4A88A]/20 transition-colors"
        >
          <Plus size={16} />
          افزودن آیتم
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3D352D] text-[#C4A88A]">
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
                className="border-b border-[#3D352D]/50 hover:bg-[#292524]/50 transition-colors"
              >
                <td className="py-3 px-2 font-bold text-[#EDE4D8]">
                  {item.nameFa}
                </td>
                <td className="py-3 px-2 text-[#8B7355] text-xs font-sans">
                  {item.nameEn}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs bg-[#292524] text-[#C4A88A] px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </td>
                <td
                  className="py-3 px-2 text-[#C4A88A] font-bold font-sans text-xs"
                  dir="ltr"
                >
                  {formatPrice(item.price)}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B7355] hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.nameFa)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B7355] hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors"
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
            <p className="text-[#8B7355]">هیچ آیتمی در منو وجود ندارد.</p>
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
                className="bg-[#1C1917] border border-[#3D352D] rounded-2xl p-6 w-full max-w-md shadow-xl shadow-black/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#EDE4D8]">
                    {editingId ? "ویرایش آیتم" : "افزودن آیتم جدید"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-[#8B7355] hover:text-[#C4A88A] transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-bold text-[#C4A88A] mb-1.5">
                        شناسه (slug)
                      </label>
                      <input
                        value={form.id}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, id: e.target.value }))
                        }
                        className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-2.5 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50 placeholder:text-[#8B7355] font-sans"
                        placeholder="e.g. espresso"
                        dir="ltr"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-[#C4A88A] mb-1.5">
                        نام فارسی
                      </label>
                      <input
                        value={form.nameFa}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nameFa: e.target.value }))
                        }
                        className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-2.5 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50 placeholder:text-[#8B7355]"
                        placeholder="اسپرسو"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#C4A88A] mb-1.5">
                        نام انگلیسی
                      </label>
                      <input
                        value={form.nameEn}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nameEn: e.target.value }))
                        }
                        className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-2.5 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50 placeholder:text-[#8B7355] font-sans"
                        placeholder="Espresso"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-[#C4A88A] mb-1.5">
                        قیمت (تومان)
                      </label>
                      <input
                        value={form.price}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setForm((f) => ({ ...f, price: v }));
                        }}
                        className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-2.5 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50 placeholder:text-[#8B7355] font-sans"
                        placeholder="150000"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#C4A88A] mb-1.5">
                        دسته‌بندی
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-2.5 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50"
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
                    className="flex-1 py-2.5 rounded-xl bg-[#292524] text-[#8B7355] text-sm font-bold border border-[#3D352D] hover:bg-[#3D352D] transition-colors"
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
                    className="flex-1 py-2.5 rounded-xl bg-[#C4A88A] text-[#0C0A09] text-sm font-bold hover:bg-[#D4B896] disabled:opacity-40 transition-colors"
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
