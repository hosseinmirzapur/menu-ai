import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "پنل مدیریت کافه",
  description: "مدیریت منو و سفارش‌های کافه",
};

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
