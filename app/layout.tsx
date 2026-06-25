import type { Metadata } from "next";
import { Inter, Vazirmatn, Space_Grotesk } from "next/font/google";
import "./styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "کافه دیجیتال | منوی آنلاین",
  description:
    "به کافه دیجیتال خوش آمدید! منوی آنلاین، سفارش هوشمند و پشتیبانی با هوش مصنوعی.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${inter.variable} ${vazirmatn.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-persian antialiased">{children}</body>
    </html>
  );
}
