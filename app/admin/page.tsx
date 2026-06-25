"use client";

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { adminLogin } from "@/actions/index";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-[#C4A88A]/10 text-[#C4A88A] font-bold text-sm border border-[#C4A88A]/20 hover:bg-[#C4A88A]/20 transition-colors disabled:opacity-50"
    >
      {pending ? "در حال ورود..." : "ورود"}
    </button>
  );
}

export default function AdminPage() {
  const [state, formAction] = useFormState(adminLogin, null);

  return (
    <main className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="bg-[#1C1917] border border-[#3D352D] rounded-2xl p-8 w-full max-w-sm shadow-xl shadow-black/30"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C4A88A]/10 flex items-center justify-center">
            <Coffee size={28} className="text-[#C4A88A]" />
          </div>
          <h1
            className="text-2xl font-bold text-[#EDE4D8]"
            style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui" }}
          >
            پنل مدیریت
          </h1>
          <p className="text-[#8B7355] text-sm mt-1">
            برای دسترسی به داشبورد وارد شوید
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-[#C4A88A] mb-1.5"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full bg-[#292524] border border-[#3D352D] rounded-xl px-4 py-3 text-sm text-[#EDE4D8] outline-none focus:border-[#C4A88A]/50 placeholder:text-[#8B7355]"
              placeholder="رمز عبور را وارد کنید"
            />
          </div>

          {state?.error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#9F391B] text-sm text-center bg-[#9F391B]/10 rounded-lg px-3 py-2"
            >
              {state.error}
            </motion.p>
          )}

          <SubmitButton />
        </form>
      </motion.div>
    </main>
  );
}
