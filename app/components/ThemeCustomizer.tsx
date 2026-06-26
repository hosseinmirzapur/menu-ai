"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Palette, RotateCcw, Check } from "lucide-react";

interface ThemeCustomizerProps {
  initialConfig: Record<string, string>;
  onSave: (config: Record<string, string>) => void;
  onClose: () => void;
}

const THEME_PRESETS: { name: string; config: Record<string, string> }[] = [
  {
    name: "برلین کنتور (پیش‌فرض)",
    config: {
      "--bg-base": "#0C0A09",
      "--bg-surface": "#1C1917",
      "--bg-elevated": "#292524",
      "--border-subtle": "#3D352D",
      "--text-primary": "#EDE4D8",
      "--text-secondary": "#C4A88A",
      "--text-muted": "#8B7355",
      "--danger": "#9F391B",
      "--success": "#5A7A5A",
    },
  },
  {
    name: "مینیمال سفید",
    config: {
      "--bg-base": "#FAFAF9",
      "--bg-surface": "#FFFFFF",
      "--bg-elevated": "#F5F5F4",
      "--border-subtle": "#E7E5E4",
      "--text-primary": "#1C1917",
      "--text-secondary": "#78716C",
      "--text-muted": "#A8A29E",
      "--danger": "#DC2626",
      "--success": "#16A34A",
    },
  },
  {
    name: "کافه گرم",
    config: {
      "--bg-base": "#2D1B0E",
      "--bg-surface": "#3D2616",
      "--bg-elevated": "#4D3120",
      "--border-subtle": "#6B442A",
      "--text-primary": "#FCE8D5",
      "--text-secondary": "#D4A574",
      "--text-muted": "#A67B5B",
      "--danger": "#B91C1C",
      "--success": "#4D7C4D",
    },
  },
  {
    name: "مدرن اروپایی",
    config: {
      "--bg-base": "#0F172A",
      "--bg-surface": "#1E293B",
      "--bg-elevated": "#334155",
      "--border-subtle": "#475569",
      "--text-primary": "#F1F5F9",
      "--text-secondary": "#94A3B8",
      "--text-muted": "#64748B",
      "--danger": "#EF4444",
      "--success": "#22C55E",
    },
  },
  {
    name: "طبیعت سبز",
    config: {
      "--bg-base": "#052E16",
      "--bg-surface": "#14532D",
      "--bg-elevated": "#166534",
      "--border-subtle": "#22C55E",
      "--text-primary": "#F0FDF4",
      "--text-secondary": "#86EFAC",
      "--text-muted": "#4ADE80",
      "--danger": "#EF4444",
      "--success": "#22C55E",
    },
  },
];

const CSS_VARS = [
  { key: "--bg-base", label: "پس‌زمینه اصلی" },
  { key: "--bg-surface", label: "پس‌زمینه کارت" },
  { key: "--bg-elevated", label: "پس‌زمینه Elevated" },
  { key: "--border-subtle", label: "رنگ حاشیه" },
  { key: "--text-primary", label: "رنگ متن اصلی" },
  { key: "--text-secondary", label: "رنگ متن ثانویه" },
  { key: "--text-muted", label: "رنگ متن کم‌رنگ" },
  { key: "--danger", label: "رنگ خطر" },
  { key: "--success", label: "رنگ موفقیت" },
];

export default function ThemeCustomizer({ initialConfig, onSave, onClose }: ThemeCustomizerProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);

  const applyPreview = useCallback((cfg: Record<string, string>) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(cfg)) {
      root.style.setProperty(key, value);
    }
  }, []);

  useEffect(() => {
    applyPreview(config);
  }, [config, applyPreview]);

  const applyPreset = (preset: { name: string; config: Record<string, string> }) => {
    setConfig({ ...preset.config });
  };

  const resetToDefaults = () => {
    const defaults = THEME_PRESETS[0].config;
    setConfig({ ...defaults });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl shadow-black/30"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: "#C4A88A" }} />
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              شخصی‌سازی تم
            </h3>
          </div>
          <button onClick={resetToDefaults} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
            <RotateCcw size={12} />
            بازنشانی
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold mb-2" style={{ color: "#C4A88A" }}>
            پالت‌های آماده
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
              >
                <div className="flex gap-0.5 shrink-0">
                  {["--bg-base", "--bg-surface", "--text-secondary", "--text-muted"].map((k) => (
                    <div key={k} className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.config[k] }} />
                  ))}
                </div>
                <span className="truncate">{preset.name}</span>
                {JSON.stringify(config) === JSON.stringify(preset.config) && (
                  <Check size={12} className="shrink-0" style={{ color: "#5A7A5A" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold" style={{ color: "#C4A88A" }}>
            رنگ‌های سفارشی
          </label>
          {CSS_VARS.map((v) => (
            <div key={v.key} className="flex items-center gap-3">
              <input
                type="color"
                value={config[v.key] || "#000000"}
                onChange={(e) => setConfig((c) => ({ ...c, [v.key]: e.target.value }))}
                className="w-10 h-10 rounded-xl border cursor-pointer"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-elevated)" }}
              />
              <input
                value={config[v.key] || ""}
                onChange={(e) => setConfig((c) => ({ ...c, [v.key]: e.target.value }))}
                className="flex-1 border rounded-xl px-3 py-2 text-xs font-mono outline-none"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                dir="ltr"
              />
              <span className="text-xs shrink-0 w-24 text-left" style={{ color: "var(--text-muted)" }}>
                {v.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
          >
            انصراف
          </button>
          <button
            onClick={() => onSave(config)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ backgroundColor: "#C4A88A", color: "#0C0A09" }}
          >
            ذخیره تم
          </button>
        </div>
      </div>
    </motion.div>
  );
}
