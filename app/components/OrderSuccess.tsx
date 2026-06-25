"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const COLORS = ["#C4A88A", "#8B7355", "#5A7A5A", "#9F391B", "#3D352D"];
const PIECES = 30;

interface ConfettiPiece {
  id: number;
  left: string;
  color: string;
  delay: string;
  size: number;
}

export default function OrderSuccess({ onClose }: { onClose: () => void }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const arr: ConfettiPiece[] = [];
    for (let i = 0; i < PIECES; i++) {
      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: `${Math.random() * 2}s`,
        size: Math.random() * 6 + 3,
      });
    }
    setPieces(arr);

    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {pieces.map((p) => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left: p.left,
                top: "-10px",
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animationDelay: p.delay,
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="bg-[#1C1917] border border-[#3D352D] rounded-2xl p-8 text-center pointer-events-auto max-w-sm mx-4"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C4A88A]/10 flex items-center justify-center">
              <Check size={28} className="text-[#C4A88A]" />
            </div>
            <h2
              className="text-2xl font-bold text-[#EDE4D8] mb-2"
              style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn)" }}
            >
              سفارش شما ثبت شد!
            </h2>
            <p className="text-[#8B7355] text-sm">
              سفارش شما در حال آماده‌سازی است. از صبر شما سپاسگزاریم.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
