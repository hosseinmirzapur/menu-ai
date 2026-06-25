"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ClipboardList } from "lucide-react";
import type { CartItem } from "./MenuGrid";
import { formatPrice } from "@/lib/menu";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: () => void;
}

function CartContent({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onClose,
}: Omit<CartSheetProps, "isOpen">) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce(
    (s, c) => s + c.menuItem.price * c.quantity,
    0
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#3D352D] shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-[#C4A88A]" />
          <span className="font-bold text-[#EDE4D8]">
            سبد خرید ({totalItems})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-[#9F391B] hover:text-[#BF593B] transition-colors px-2 py-1 rounded-lg hover:bg-[#9F391B]/10"
            >
              حذف همه
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#8B7355] hover:text-[#C4A88A] transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {cart.map((c) => (
          <div
            key={c.menuItem.id}
            className="bg-[#292524] rounded-xl p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold text-[#EDE4D8] truncate"
                style={{
                  fontFamily:
                    "var(--font-shabnam), var(--font-vazirmatn), system-ui",
                }}
              >
                {c.menuItem.nameFa}
              </p>
              <p className="text-xs text-[#8B7355] font-sans" dir="ltr">
                {formatPrice(c.menuItem.price)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQuantity(c.menuItem.id, -1)}
                className="w-8 h-8 rounded-lg bg-[#1C1917] border border-[#3D352D] flex items-center justify-center text-[#C4A88A] hover:bg-[#3D352D] transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-[#EDE4D8] font-sans">
                {c.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(c.menuItem.id, 1)}
                className="w-8 h-8 rounded-lg bg-[#1C1917] border border-[#3D352D] flex items-center justify-center text-[#C4A88A] hover:bg-[#3D352D] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => onRemoveItem(c.menuItem.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B7355] hover:text-[#9F391B] hover:bg-[#9F391B]/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList
              size={40}
              className="mx-auto mb-3 text-[#3D352D]"
            />
            <p className="text-[#8B7355] text-sm">
              سبد خرید خالی است
            </p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-[#3D352D] p-4 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8B7355]">مجموع</span>
            <span
              className="text-lg font-bold text-[#C4A88A] font-sans"
              dir="ltr"
            >
              {formatPrice(totalPrice)}
            </span>
          </div>
          <button
            onClick={() => {
              onPlaceOrder();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#C4A88A] text-[#0C0A09] font-bold text-sm hover:bg-[#D4B896] transition-colors active:scale-[0.98]"
          >
            ثبت سفارش
          </button>
        </div>
      )}
    </div>
  );
}

export default function CartSheet({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}: CartSheetProps) {
  const sharedProps = {
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onPlaceOrder,
    onClose,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-[#1C1917] border-t border-[#3D352D] rounded-t-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-xl shadow-black/40"
          >
            <div className="w-10 h-1 rounded-full bg-[#3D352D] mx-auto mt-3 mb-1 shrink-0" />
            <CartContent {...sharedProps} />
          </motion.div>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-50 hidden md:block w-[400px] h-full bg-[#1C1917] border-l border-[#3D352D] shadow-xl shadow-black/30 flex flex-col overflow-hidden"
          >
            <CartContent {...sharedProps} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
