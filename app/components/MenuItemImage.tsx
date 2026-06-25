"use client";

import { Coffee, CakeSlice, Sandwich, Salad, Utensils } from "lucide-react";
import type { ReactNode } from "react";

const GRADIENTS: Record<string, string> = {
  coffee: "conic-gradient(from 45deg at 50% 60%, #3D352D, #1C1917, #5A4A3A, #3D352D)",
  cappuccino: "radial-gradient(ellipse at 50% 40%, #8B7355, #3D352D 60%, #1C1917)",
  latte: "linear-gradient(160deg, #C4A88A 0%, #8B7355 40%, #3D352D 80%)",
  default: "linear-gradient(160deg, #292524, #1C1917, #3D352D)",
};

const PATTERNS: Record<string, string> = {
  "chocolate-cake": "radial-gradient(circle at 20% 30%, #5A4A3A 2px, transparent 2px)",
  "chicken-sandwich": "linear-gradient(45deg, #3D352D 1px, transparent 1px)",
  "caesar-salad": "radial-gradient(ellipse at 50% 80%, #5A7A5A 0%, transparent 60%)",
};

const ICON_MAP: Record<string, ReactNode> = {
  coffee: <Coffee size={24} />,
  cappuccino: <Coffee size={24} />,
  latte: <Coffee size={24} />,
  "chocolate-cake": <CakeSlice size={24} />,
  "chicken-sandwich": <Sandwich size={24} />,
  "caesar-salad": <Salad size={24} />,
};

interface MenuItemImageProps {
  itemId: string;
  nameFa: string;
}

export default function MenuItemImage({ itemId }: MenuItemImageProps) {
  return (
    <div
      className="relative w-full aspect-square overflow-hidden"
      style={{
        background: GRADIENTS[itemId] || GRADIENTS.default,
        backgroundSize: "cover",
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: PATTERNS[itemId] || "",
          backgroundSize: itemId === "chocolate-cake" ? "16px 16px" : "20px 20px",
        }}
      />
      {(itemId === "coffee" || itemId === "cappuccino" || itemId === "latte") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/5 aspect-square">
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle at 40% 35%, #C4A88A, transparent 70%)",
              }}
            />
            <div className="absolute inset-[15%] rounded-full border border-[#C4A88A]/20" />
            <div className="absolute inset-[30%] rounded-full border border-[#C4A88A]/10" />
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-2 opacity-60">
        {ICON_MAP[itemId] || <Utensils size={24} />}
      </div>
    </div>
  );
}
