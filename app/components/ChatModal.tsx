"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Coffee,
  X,
  ShoppingCart,
  Mic,
  MicOff,
  PartyPopper,
  HelpCircle,
  ThumbsUp,
  Smartphone,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { CartItem } from "./MenuGrid";

const EMOJI_ICONS: Record<string, ReactNode> = {
  "🎉": <PartyPopper size={16} className="inline align-middle mx-0.5" />,
  "🤔": <HelpCircle size={16} className="inline align-middle mx-0.5" />,
  "👍": <ThumbsUp size={16} className="inline align-middle mx-0.5" />,
  "📱": <Smartphone size={16} className="inline align-middle mx-0.5" />,
  "🔄": <RefreshCw size={16} className="inline align-middle mx-0.5" />,
  "✅": <CheckCircle size={16} className="inline align-middle mx-0.5" />,
  "❌": <XCircle size={16} className="inline align-middle mx-0.5" />,
  "🎤": <Mic size={16} className="inline align-middle mx-0.5" />,
};

function MsgText({ content }: { content: string }) {
  const parts = content.split(/([🎉🤔👍📱🔄✅❌🎤])/);
  return (
    <>
      {parts.map((part, i) =>
        EMOJI_ICONS[part] ? (
          <span key={i}>{EMOJI_ICONS[part]}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatModalProps {
  cart: CartItem[];
  onOrderSuccess: () => void;
  restaurantSlug?: string;
}

type OrderStep =
  | "idle"
  | "collect_table"
  | "collect_phone"
  | "submitting"
  | "done";

export default function ChatModal({ cart, onOrderSuccess, restaurantSlug = "berlin-kontor" }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "سلام! به کافه دیجیتال خوش آمدی 🎉 من دستیار هوشمند کافه هستم. می‌توانی از منو انتخاب کنی یا سوال بپرسی!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [orderStep, setOrderStep] = useState<OrderStep>("idle");
  const [tableNumber, setTableNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const isBrowser = typeof window !== "undefined";
  const SpeechRecognition =
    isBrowser &&
    ((window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, [SpeechRecognition]);

  const totalPrice = cart.reduce(
    (sum, c) => sum + c.menuItem.price * c.quantity,
    0
  );

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg = text.trim();
      setInput("");
      addMessage({ role: "user", content: userMsg });

      const lower = userMsg.toLowerCase();

      if (
        lower.includes("confirm") ||
        lower.includes("order") ||
        lower.includes("تأیید") ||
        lower.includes("سفارش") ||
        lower.includes("ثبت")
      ) {
        if (cart.length === 0) {
          addMessage({
            role: "assistant",
            content:
              "🤔 سبد خریدت خالی است. لطفاً اول آیتم‌های مورد نظرت را از منو انتخاب کن.",
          });
          return;
        }
        setOrderStep("collect_table");
        addMessage({
          role: "assistant",
          content: "👍 عالیه! لطفاً شماره میزت رو وارد کن (مثلاً: ۳):",
        });
        return;
      }

      if (orderStep === "collect_table") {
        setTableNumber(userMsg);
        setOrderStep("collect_phone");
        addMessage({
          role: "assistant",
          content:
            "📱 ممنون! حالا لطفاً شماره موبایلت رو وارد کن (مثلاً: ۰۹۱۲۳۴۵۶۷۸۹):",
        });
        return;
      }

      if (orderStep === "collect_phone") {
        setPhoneNumber(userMsg);
        setOrderStep("submitting");
        addMessage({
          role: "assistant",
          content: "🔄 در حال ثبت سفارش... یک لحظه صبر کن.",
        });
        await submitOrder(tableNumber, userMsg);
        setOrderStep("done");
        addMessage({
          role: "assistant",
          content:
            "✅ سفارش تو با موفقیت ثبت شد! آماده‌سازی شروع شده 🎉",
        });
        onOrderSuccess();
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMsg }].slice(
              -10
            ),
            restaurant_slug: restaurantSlug,
          }),
        });
        const data = await res.json();
        addMessage({
          role: "assistant",
          content: data.reply || "پاسخی دریافت نشد.",
        });
      } catch {
        addMessage({
          role: "assistant",
          content: "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کن.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, orderStep, cart, tableNumber, phoneNumber, addMessage, onOrderSuccess, restaurantSlug]
  );

  const submitOrder = async (table: string, phone: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            id: c.menuItem.id,
            name: c.menuItem.nameFa,
            nameFa: c.menuItem.nameFa,
            nameEn: c.menuItem.nameEn,
            price: c.menuItem.price,
            quantity: c.quantity,
          })),
          table,
          phone,
          restaurant_slug: restaurantSlug,
        }),
      });
      if (!res.ok) throw new Error("Failed to create order");
    } catch (err) {
      console.error("Order error:", err);
      addMessage({
        role: "assistant",
        content:
          "❌ خطا در ثبت سفارش. لطفاً دوباره تلاش کن یا با اپراتور تماس بگیر.",
      });
    }
  };

  const toggleListening = useCallback(() => {
    if (!SpeechRecognition) {
      addMessage({
        role: "assistant",
        content:
          "مرورگرت از ورود صوتی پشتیبانی نمی‌کند. لطفاً متن را تایپ کن.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());

        const recognition = new SpeechRecognition();
        recognition.lang = "fa-IR";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          setTimeout(() => handleSendMessage(transcript), 100);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === "no-speech") {
            addMessage({
              role: "assistant",
              content: "صدایی شناسایی نشد. لطفاً دوباره تلاش کن.",
            });
          } else if (event.error === "audio-capture") {
            addMessage({
              role: "assistant",
              content: "میکروفون یافت نشد. لطفاً میکروفون را وصل کن.",
            });
          } else if (event.error === "not-allowed") {
            addMessage({
              role: "assistant",
              content:
                "دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر دسترسی را مجاز کن.",
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      })
      .catch((err) => {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          addMessage({
            role: "assistant",
            content:
              "دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر دسترسی را مجاز کن.",
          });
        } else {
          addMessage({
            role: "assistant",
            content:
              "میکروفون در دسترس نیست. لطفاً متن را تایپ کن.",
          });
        }
      });
  }, [SpeechRecognition, isListening, addMessage, handleSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full border shadow-lg shadow-black/30 flex items-center justify-center hover:bg-[#292524] transition-colors active:scale-95"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        aria-label="چت با دستیار"
      >
        <MessageCircle size={24} style={{ color: "var(--text-secondary)" }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end md:p-6"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative w-full md:w-[380px] h-[80vh] md:h-[600px] border rounded-t-2xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <Coffee size={20} style={{ color: "var(--text-secondary)" }} />
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    دستیار کافه
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full border"
                      style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
                    >
                      {cart.reduce((s, c) => s + c.quantity, 0)}
                    </span>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:text-[#C4A88A] transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#C4A88A]/10 text-[#C4A88A] rounded-br-md border border-[#C4A88A]/20"
                          : "bg-[#292524] text-[#EDE4D8] rounded-bl-md"
                      }`}
                    >
                      <MsgText content={msg.content} />
                    </div>
                  </div>
                ))}

                {cart.length > 0 && orderStep === "idle" && (
                  <div className="bg-[#292524] rounded-2xl p-3 text-sm">
                    <p className="font-bold text-[#C4A88A] mb-2">
                      <ShoppingCart size={16} className="inline align-middle ml-1" />
                      سبد خرید
                    </p>
                    {cart.map((c) => (
                      <div
                        key={c.menuItem.id}
                        className="flex justify-between text-[#8B7355] text-xs py-1"
                      >
                        <span>
                          {c.menuItem.nameFa} × {c.quantity}
                        </span>
                        <span dir="ltr" className="font-sans">
                          {new Intl.NumberFormat("fa-IR").format(
                            c.menuItem.price * c.quantity
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-[#3D352D] mt-2 pt-2 flex justify-between font-bold text-[#EDE4D8]">
                      <span>مجموع</span>
                      <span dir="ltr" className="font-sans">
                        {new Intl.NumberFormat("fa-IR").format(totalPrice)} تومان
                      </span>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-[#292524] rounded-2xl rounded-bl-md p-3">
                      <span className="text-[#8B7355]">...در حال فکر کردن</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                {orderStep === "collect_table" || orderStep === "collect_phone" ? (
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type={orderStep === "collect_phone" ? "tel" : "text"}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        orderStep === "collect_table"
                          ? "شماره میز را وارد کنید..."
                          : "شماره موبایل را وارد کنید..."
                      }
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355]"
                      style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSendMessage(input)}
                      disabled={!input.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-40 transition-colors"
                      style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
                    >
                      ارسال
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={toggleListening}
                      disabled={!micSupported}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isListening
                          ? "bg-[#9F391B] text-white animate-pulse"
                          : !micSupported
                          ? "bg-[#292524] text-[#5A4A3A] border border-[#3D352D] cursor-not-allowed"
                          : "bg-[#292524] text-[#8B7355] border border-[#3D352D] hover:bg-[#3D352D]"
                      }`}
                      title={micSupported ? "ورود صوتی" : "مرورگر از ورود صوتی پشتیبانی نمی‌کند"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="پیام خود را بنویسید..."
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355]"
                      style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                      disabled={orderStep === "submitting" || orderStep === "done"}
                    />
                    <button
                      onClick={() => handleSendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-40 transition-colors"
                      style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
                    >
                      ارسال
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
