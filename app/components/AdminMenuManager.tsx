"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, Trash2, X, GripHorizontal } from "lucide-react";

interface MenuFormData {
  id: string;
  nameFa: string;
  nameEn: string;
  price: string;
  category: string;
  sortOrder: number;
}

const emptyForm: MenuFormData = {
  id: "",
  nameFa: "",
  nameEn: "",
  price: "",
  category: "",
  sortOrder: 0,
};

interface CategoryOption {
  id: string;
  nameFa: string;
  nameEn: string;
}

function SortableItemRow({
  item,
  categories,
  onEdit,
  onDelete,
}: {
  item: MenuFormData;
  categories: CategoryOption[];
  onEdit: (item: MenuFormData) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: "var(--bg-elevated)",
    borderColor: "var(--border-subtle)",
  };

  const catName = categories.find((c) => c.id === item.category)?.nameFa || item.category;

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("fa-IR").format(Number(p)) + " تومان";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 rounded-xl border transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-[#C4A88A]/10 transition-colors shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        <GripHorizontal size={16} />
      </button>
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
        <div className="col-span-3">
          <div className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {item.nameFa}
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-sans truncate block" style={{ color: "var(--text-muted)" }}>
            {item.nameEn}
          </span>
        </div>
        <div className="col-span-3">
          <span
            className="text-xs px-2 py-0.5 rounded-full inline-block"
            style={{ backgroundColor: "var(--bg-elevated)", color: "#C4A88A", borderColor: "var(--border-subtle)" }}
          >
            {catName}
          </span>
        </div>
        <div className="col-span-2 text-right">
          <span className="text-xs font-bold font-sans" dir="ltr" style={{ color: "var(--text-secondary)" }}>
            {formatPrice(item.price)}
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(item.id, item.nameFa)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMenuManager({ restaurantId }: { restaurantId?: string }) {
  const [items, setItems] = useState<MenuFormData[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const rid = restaurantId || "rest_default";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("restaurant_id", rid);
      const [itemsRes, catRes] = await Promise.all([
        fetch(`/api/menu-items?${params}`),
        fetch(`/api/categories?${params}`),
      ]);
      const itemsData = await itemsRes.json();
      const catData = await catRes.json();
      setCategories(catData.categories || []);
      setItems(
        (itemsData.items || []).map((i: any) => ({
          id: i.id,
          nameFa: i.nameFa,
          nameEn: i.nameEn,
          price: String(i.price),
          category: i.categoryId || i.category || "",
          sortOrder: i.sortOrder || 0,
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
    setForm({ ...emptyForm, category: categories[0]?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (item: MenuFormData) => {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  };

  const saveAll = async (updated: MenuFormData[]) => {
    setSaving(true);
    try {
      const sorted = updated.map((item, i) => ({ ...item, sortOrder: i }));
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: sorted.map((i) => ({
            id: i.id,
            nameFa: i.nameFa,
            nameEn: i.nameEn,
            price: Number(i.price),
            category: i.category,
            categoryId: i.category,
            sortOrder: i.sortOrder,
          })),
          restaurant_id: rid,
        }),
      });
      if (res.ok) {
        setItems(sorted);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      saveAll(reordered);
    }
  };

  const handleSave = async () => {
    if (!form.nameFa.trim() || !form.nameEn.trim() || !form.price.trim()) return;
    if (!editingId && !form.id.trim()) return;

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              nameFa: form.nameFa.trim(),
              nameEn: form.nameEn.trim(),
              price: form.price,
              category: form.category,
            }
          : item
      );
      setItems(updated);
      setModalOpen(false);
      await saveAll(updated);
    } else {
      const newItem: MenuFormData = {
        id: form.id.trim(),
        nameFa: form.nameFa.trim(),
        nameEn: form.nameEn.trim(),
        price: form.price,
        category: form.category,
        sortOrder: items.length,
      };
      const updated = [...items, newItem];
      setItems(updated);
      setModalOpen(false);
      await saveAll(updated);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف "${name}" اطمینان دارید؟`)) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await saveAll(updated);
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

      {categories.length === 0 && (
        <div
          className="mb-4 p-3 rounded-xl text-sm border"
          style={{ backgroundColor: "rgba(196,168,138,0.05)", borderColor: "rgba(196,168,138,0.15)", color: "var(--text-muted)" }}
        >
          ابتدا در بخش "دسته‌بندی‌ها" دسته‌بندی اضافه کنید.
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItemRow
                key={item.id}
                item={item}
                categories={categories}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-muted)" }}>هیچ آیتمی در منو وجود ندارد.</p>
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
                        {categories.length === 0 && <option value="">بدون دسته‌بندی</option>}
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameFa} ({c.nameEn})
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
