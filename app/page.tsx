"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Coffee } from "lucide-react";
import MenuGrid from "@/components/MenuGrid";
import type { CartItem } from "@/components/MenuGrid";
import FloatingOrbs from "@/components/FloatingOrbs";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { RestaurantProvider, useRestaurant } from "@/lib/restaurant-context";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ChatModal = dynamic(() => import("@/components/ChatModal"), {
  ssr: false,
});
const OrderSuccess = dynamic(() => import("@/components/OrderSuccess"), {
  ssr: false,
});

function HomePageInner() {
  const { restaurant, slug } = useRestaurant();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=200",
      onUpdate: (self) => {
        if (headerRef.current) {
          const progress = self.progress;
          gsap.set(headerRef.current, {
            opacity: 1 - progress * 0.4,
            y: -progress * 30,
            scale: 1 - progress * 0.02,
          });
        }
      },
    });
  }, { scope: containerRef });

  const handleCartChange = useCallback((items: CartItem[]) => {
    setCart(items);
  }, []);

  const handleOrderSuccess = useCallback(() => {
    setCart([]);
    setShowSuccess(true);
  }, []);

  const handleCartActions = useCallback((actions: Array<{ type: string; item?: any; itemId?: string; quantity: number }>) => {
    setCart((prev) => {
      let updated = [...prev];
      for (const action of actions) {
        if (action.type === "add" && action.item) {
          const existing = updated.find((c) => c.menuItem.id === action.item.id);
          if (existing) {
            existing.quantity += action.quantity;
          } else {
            updated.push({ menuItem: action.item, quantity: action.quantity });
          }
        } else if (action.type === "remove" && action.itemId) {
          if (action.itemId === "*") {
            updated = [];
          } else {
            const idx = updated.findIndex((c) => c.menuItem.id === action.itemId);
            if (idx >= 0) {
              if (updated[idx].quantity <= action.quantity) {
                updated.splice(idx, 1);
              } else {
                updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - action.quantity };
              }
            }
          }
        }
      }
      return updated;
    });
  }, []);

  const nameFa = restaurant?.nameFa || "کافه دیجیتال";
  const descFa = restaurant?.descriptionFa || "آیتم‌های مورد نظرت را انتخاب کن و با دستیار هوشمند سفارش بده";

  return (
    <main ref={containerRef} className="min-h-screen relative" style={{ backgroundColor: "var(--bg-base)" }}>
      <FloatingOrbs />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        <motion.header ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#1C1917] border border-[#3D352D] rounded-full px-5 py-2 mb-5">
            <Coffee size={20} className="text-[#C4A88A]" />
            <span className="text-sm text-[#C4A88A] font-bold">
              {nameFa}
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
          >
            منوی کافه
          </h1>
          <p className="text-sm md:text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            {descFa}
          </p>
          <div className="mt-5 flex justify-center">
            <div className="bg-[#1C1917] border border-[#3D352D] rounded-xl p-3">
              <QRCodeDisplay size={70} compact />
            </div>
          </div>
        </motion.header>

        <MenuGrid onCartChange={handleCartChange} restaurantSlug={slug} restaurantId={restaurant?.id} />
      </div>

      <ChatModal cart={cart} onOrderSuccess={handleOrderSuccess} onCartActions={handleCartActions} restaurantSlug={slug} restaurantId={restaurant?.id} />

      {showSuccess && (
        <OrderSuccess onClose={() => setShowSuccess(false)} />
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <RestaurantProvider>
      <HomePageInner />
    </RestaurantProvider>
  );
}
