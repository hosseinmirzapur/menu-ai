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
  restaurantId?: string;
}

export default function ChatModal({ cart, onOrderSuccess, restaurantSlug = "berlin-kontor", restaurantId }: ChatModalProps) {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const isBrowser = typeof window !== "undefined";
  const SpeechRecognition =
    isBrowser &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!SpeechRecognition) setMicSupported(false);
  }, [SpeechRecognition]);

  const totalPrice = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg = text.trim();
      setInput("");
      addMessage({ role: "user", content: userMsg });
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMsg }].slice(-10),
            restaurant_slug: restaurantSlug,
            restaurant_id: restaurantId,
            cart,
          }),
        });

        const data = await res.json();
        if (data.reply) {
          addMessage({ role: "assistant", content: data.reply });
        }
        if (data.orderPlaced) {
          onOrderSuccess();
        }
      } catch {
        addMessage({
          role: "assistant",
          content: "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کن.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, cart, addMessage, restaurantSlug, restaurantId, onOrderSuccess]
  );

  const toggleListening = useCallback(() => {
    if (!SpeechRecognition) {
      addMessage({
        role: "assistant",
        content: "مرورگرت از ورود صوتی پشتیبانی نمی‌کند. لطفاً متن را تایپ کن.",
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
            addMessage({ role: "assistant", content: "صدایی شناسایی نشد. لطفاً دوباره تلاش کن." });
          } else if (event.error === "audio-capture") {
            addMessage({ role: "assistant", content: "میکروفون یافت نشد. لطفاً میکروفون را وصل کن." });
          } else if (event.error === "not-allowed") {
            addMessage({ role: "assistant", content: "دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر دسترسی را مجاز کن." });
          }
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      })
      .catch((err) => {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          addMessage({ role: "assistant", content: "دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر دسترسی را مجاز کن." });
        } else {
          addMessage({ role: "assistant", content: "میکروفون در دسترس نیست. لطفاً متن را تایپ کن." });
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
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />

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
                  <button onClick={() => setIsOpen(false)} className="hover:text-[#C4A88A] transition-colors" style={{ color: "var(--text-muted)" }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] md:max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed break-words ${
                        msg.role === "user"
                          ? "bg-[#C4A88A]/10 text-[#C4A88A] rounded-br-md border border-[#C4A88A]/20"
                          : "bg-[#292524] text-[#EDE4D8] rounded-bl-md"
                      }`}
                    >
                      <MsgText content={msg.content} />
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-[#292524] rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                      <span className="text-[#8B7355]">...در حال فکر کردن</span>
                    </div>
                  </div>
                )}

                {cart.length > 0 && !isLoading && (
                  <div className="bg-[#292524] rounded-2xl p-3 text-sm">
                    <p className="font-bold text-[#C4A88A] mb-2">
                      <ShoppingCart size={16} className="inline align-middle ml-1" />
                      سبد خرید
                    </p>
                    {cart.map((c) => (
                      <div key={c.menuItem.id} className="flex justify-between text-[#8B7355] text-xs py-1">
                        <span>{c.menuItem.nameFa} × {c.quantity}</span>
                        <span dir="ltr" className="font-sans shrink-0">
                          {new Intl.NumberFormat("fa-IR").format(c.menuItem.price * c.quantity)} تومان
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

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
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
                    className="flex-1 min-w-0 border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#8B7355]"
                    style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => handleSendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border disabled:opacity-40 transition-colors shrink-0"
                    style={{ backgroundColor: "rgba(196,168,138,0.1)", color: "#C4A88A", borderColor: "rgba(196,168,138,0.2)" }}
                  >
                    ارسال
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
