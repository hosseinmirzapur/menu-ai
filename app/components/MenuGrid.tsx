"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { menuItems as defaultItems, formatPrice } from "@/lib/menu";
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
}: {
  onCartChange?: (items: CartItem[]) => void;
}) {
  const [items, setItems] = useState<MenuItem[]>(defaultItems);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetch("/api/menu-items")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, []);

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
      <div className="text-center py-12 text-[#8B7355]">
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
            className="group bg-[#1C1917] border border-[#3D352D] rounded-xl overflow-hidden flex flex-col hover:border-[#C4A88A]/30 transition-colors"
          >
            <MenuItemImage itemId={item.id} nameFa={item.nameFa} />
            <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
              <h3
                className="font-headingPersian text-base md:text-lg font-bold text-[#EDE4D8]"
                style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui" }}
              >
                {item.nameFa}
              </h3>
              <p className="text-sm text-[#8B7355] font-sans">
                {item.nameEn}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm md:text-base font-bold text-[#C4A88A] font-sans" dir="ltr">
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="px-3 py-1.5 rounded-lg bg-[#C4A88A]/10 text-[#C4A88A] text-sm font-bold hover:bg-[#C4A88A]/20 transition-colors active:scale-95 border border-[#C4A88A]/20"
                >
                  + افزودن
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-[#8B7355] text-sm">
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
            <div className="bg-[#1C1917] border border-[#3D352D] rounded-xl px-5 py-3 shadow-lg shadow-black/30 flex items-center gap-3 hover:border-[#C4A88A]/30 transition-colors">
              <ShoppingCart size={18} className="text-[#C4A88A]" />
              <span className="text-[#EDE4D8] font-bold">
                {totalItems} آیتم
              </span>
              <span className="w-px h-5 bg-[#3D352D]" />
              <span className="text-[#C4A88A] font-bold font-sans" dir="ltr">
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
