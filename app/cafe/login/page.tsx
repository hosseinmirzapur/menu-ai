"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { cafeLogin } from "@/actions/cafe-auth";
import { Coffee, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState: { error?: string } | null = null;

export default function CafeLoginPage() {
  const [state, formAction] = useFormState(cafeLogin, initialState);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>در حال بارگذاری...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <div
          className="border rounded-2xl p-8 shadow-xl shadow-black/30"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: "rgba(196,168,138,0.1)" }}>
              <Coffee size={24} className="text-[#C4A88A]" />
            </div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui", color: "var(--text-primary)" }}
            >
              ورود به پنل کافه
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              با شناسه کافه و رمز عبور وارد شوید
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                شناسه کافه (slug)
              </label>
              <input
                name="slug"
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355] font-sans"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                placeholder="my-cafe"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: "#C4A88A" }}>
                رمز عبور
              </label>
              <input
                type="password"
                name="password"
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355]"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                placeholder="••••••"
                required
              />
            </div>

            {state?.error && (
              <div className="p-3 rounded-xl text-sm bg-[#9F391B]/10 text-[#9F391B] border border-[#9F391B]/20">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{ backgroundColor: "#C4A88A", color: "#0C0A09" }}
            >
              ورود
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <ArrowLeft size={12} />
              ورود ادمین اصلی
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
