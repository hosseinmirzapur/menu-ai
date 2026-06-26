"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { getMenuItems, formatPrice } from "@/lib/menu";
import type { MenuItem } from "@/lib/menu";
import MenuItemImage from "./MenuItemImage";
import CartSheet from "./CartSheet";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function MenuGrid({
  onCartChange,
  restaurantSlug = "berlin-kontor",
  restaurantId,
}: {
  onCartChange?: (items: CartItem[]) => void;
  restaurantSlug?: string;
  restaurantId?: string;
}) {
  const [items, setItems] = useState<MenuItem[]>(() => getMenuItems(restaurantSlug));
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (restaurantId) params.set("restaurant_id", restaurantId);
    if (restaurantSlug) params.set("slug", restaurantSlug);

    fetch(`/api/menu-items?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, [restaurantSlug, restaurantId]);

  const notify = useCallback(
    (next: CartItem[]) => {
      onCartChange?.(next);
    },
    [onCartChange]
  );

  const addToCart = useCallback(
    (item: MenuItem) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.menuItem.id === item.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((c) =>
            c.menuItem.id === item.id
              ? { ...c, quantity: c.quantity + 1 }
              : c
          );
        } else {
          next = [...prev, { menuItem: item, quantity: 1 }];
        }
        notify(next);
        return next;
      });
    },
    [notify]
  );

  const updateQuantity = useCallback(
    (itemId: string, delta: number) => {
      setCart((prev) => {
        let next = prev
          .map((c) =>
            c.menuItem.id === itemId
              ? { ...c, quantity: c.quantity + delta }
              : c
          )
          .filter((c) => c.quantity > 0);
        notify(next);
        return next;
      });
    },
    [notify]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setCart((prev) => {
        const next = prev.filter((c) => c.menuItem.id !== itemId);
        notify(next);
        return next;
      });
    },
    [notify]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    notify([]);
    setSheetOpen(false);
  }, [notify]);

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );

  if (menuLoading) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="group border rounded-xl overflow-hidden flex flex-col hover:border-[#C4A88A]/30 transition-colors"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <MenuItemImage itemId={item.id} nameFa={item.nameFa} />
            <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
              <h3
                className="font-headingPersian text-base md:text-lg font-bold"
                style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
              >
                {item.nameFa}
              </h3>
              <p className="text-sm font-sans" style={{ color: "var(--text-muted)" }}>
                {item.nameEn}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm md:text-base font-bold font-sans" dir="ltr" style={{ color: "var(--text-secondary)" }}>
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#C4A88A]/20 transition-colors active:scale-95 border"
                  style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
                >
                  + افزودن
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              هیچ آیتمی در منو وجود ندارد.
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 z-40 cursor-pointer"
            onClick={() => setSheetOpen(true)}
          >
            <div className="rounded-xl px-5 py-3 shadow-lg shadow-black/30 flex items-center gap-3 hover:border-[#C4A88A]/30 transition-colors border"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <ShoppingCart size={18} style={{ color: "var(--text-secondary)" }} />
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                {totalItems} آیتم
              </span>
              <span className="w-px h-5" style={{ backgroundColor: "var(--border-subtle)" }} />
              <span className="font-bold font-sans" dir="ltr" style={{ color: "var(--text-secondary)" }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onPlaceOrder={() => {}}
      />
    </div>
  );
}

export type { CartItem };
