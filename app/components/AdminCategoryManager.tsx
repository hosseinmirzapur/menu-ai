"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Plus, Pencil, Trash2, X, Check, GripHorizontal } from "lucide-react";

interface CategoryItem {
  id: string;
  nameFa: string;
  nameEn: string;
  sortOrder: number;
}

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  onEdit: (c: CategoryItem) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: "var(--bg-elevated)",
    borderColor: "var(--border-subtle)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 rounded-xl border transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-[#C4A88A]/10 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <GripHorizontal size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {category.nameFa}
        </div>
        <div className="text-xs font-sans truncate" style={{ color: "var(--text-muted)" }}>
          {category.nameEn}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#C4A88A] hover:bg-[#C4A88A]/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(category.id, category.nameFa)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoryManager({ restaurantId }: { restaurantId?: string }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newFa, setNewFa] = useState("");
  const [newEn, setNewEn] = useState("");

  const rid = restaurantId || "rest_default";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategories = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("restaurant_id", rid);
      const res = await fetch(`/api/categories?${params}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, [rid]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveAll = async (updated: CategoryItem[]) => {
    try {
      const items = updated.map((c, i) => ({ ...c, sortOrder: i }));
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: items, restaurant_id: rid }),
      });
      if (res.ok) {
        setCategories(items);
      }
    } catch (err) {
      console.error("Save categories error:", err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(categories, oldIndex, newIndex);
      setCategories(reordered);
      saveAll(reordered);
    }
  };

  const handleAdd = async () => {
    if (!newFa.trim() || !newEn.trim()) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const updated = [...categories, { id, nameFa: newFa.trim(), nameEn: newEn.trim(), sortOrder: categories.length }];
    setNewFa("");
    setNewEn("");
    setShowAdd(false);
    await saveAll(updated);
  };

  const handleEdit = async () => {
    if (!editing || !editing.nameFa.trim() || !editing.nameEn.trim()) return;
    const updated = categories.map((c) => (c.id === editing.id ? editing : c));
    setEditing(null);
    await saveAll(updated);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف دسته‌بندی "${name}" اطمینان دارید؟`)) return;
    const res = await fetch(`/api/categories/${id}?restaurant_id=${rid}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
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
          مدیریت دسته‌بندی‌ها
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-colors"
          style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
        >
          <Plus size={16} />
          افزودن دسته
        </button>
      </div>

      {showAdd && (
        <div
          className="flex items-center gap-2 p-3 mb-3 rounded-xl border"
          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
        >
          <input
            value={newFa}
            onChange={(e) => setNewFa(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            placeholder="نام فارسی"
          />
          <input
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none font-sans"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            placeholder="English name"
            dir="ltr"
          />
          <button
            onClick={handleAdd}
            disabled={!newFa.trim() || !newEn.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:text-[#5A7A5A] hover:bg-[#5A7A5A]/10 transition-colors shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewFa(""); setNewEn(""); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.map((category) => (
              <SortableCategoryRow
                key={category.id}
                category={category}
                onEdit={(c) => setEditing({ ...c })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-muted)" }}>هیچ دسته‌بندی‌ای وجود ندارد.</p>
        </div>
      )}

      {editing && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setEditing(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="border rounded-2xl p-6 w-full max-w-md shadow-xl shadow-black/30"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                  ویرایش دسته‌بندی
                </h3>
                <button
                  onClick={() => setEditing(null)}
                  className="hover:text-[#C4A88A] transition-colors p-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                    نام فارسی
                  </label>
                  <input
                    value={editing.nameFa}
                    onChange={(e) => setEditing({ ...editing, nameFa: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                    نام انگلیسی
                  </label>
                  <input
                    value={editing.nameEn}
                    onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none font-sans"
                    style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
                >
                  انصراف
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editing.nameFa.trim() || !editing.nameEn.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: "#C4A88A", color: "#0C0A09" }}
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
