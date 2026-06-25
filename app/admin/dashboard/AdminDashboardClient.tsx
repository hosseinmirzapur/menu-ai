"use client";

import { useState } from "react";
import { adminLogout } from "@/actions/index";
import AdminTable from "@/components/AdminTable";
import AdminMenuManager from "@/components/AdminMenuManager";
import QRCodeDisplay from "@/components/QRCodeDisplay";

type Tab = "orders" | "menu";

export default function AdminDashboardClient() {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <main className="min-h-screen bg-[#0C0A09] relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="bg-[#1C1917] border border-[#3D352D] rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold text-[#EDE4D8]"
                style={{ fontFamily: "var(--font-shabnam), var(--font-vazirmatn), system-ui" }}
              >
                داشبورد مدیریت
              </h1>
              <p className="text-[#8B7355] text-sm mt-1">
                مشاهده و مدیریت سفارش‌ها و منو
              </p>
            </div>
            <form action={adminLogout}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#292524] text-[#8B7355] text-sm font-bold border border-[#3D352D] hover:bg-[#3D352D] transition-colors"
              >
                خروج
              </button>
            </form>
          </div>
        </div>

        <div className="flex gap-1 mb-4 bg-[#1C1917] border border-[#3D352D] rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "orders"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            سفارش‌ها
          </button>
          <button
            onClick={() => setTab("menu")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "menu"
                ? "bg-[#C4A88A] text-[#0C0A09]"
                : "text-[#8B7355] hover:text-[#C4A88A]"
            }`}
          >
            مدیریت منو
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-[#1C1917] border border-[#3D352D] rounded-2xl p-4 md:p-6 overflow-hidden">
            {tab === "orders" ? <AdminTable /> : <AdminMenuManager />}
          </div>
          <div className="bg-[#1C1917] border border-[#3D352D] rounded-2xl p-4 md:p-6 flex flex-col items-center">
            <h2 className="text-sm font-bold text-[#C4A88A] mb-3">
              اسکن کنید
            </h2>
            <QRCodeDisplay />
          </div>
        </div>
      </div>
    </main>
  );
}
