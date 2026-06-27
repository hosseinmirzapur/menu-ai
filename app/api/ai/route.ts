import { NextRequest } from "next/server";
import { getRestaurantBySlug, getDbMenuItems, createOrder } from "@/lib/db";
import { buildAgentKit, buildSystemPrompt, sanitizeMessage, sanitizePhone, sanitizeTableNumber } from "@/lib/agent";

interface CartItem {
  menuItem: { id: string; nameFa: string; nameEn: string; price: number };
  quantity: number;
}

interface CartActionAdd {
  type: "add";
  item: { id: string; nameFa: string; nameEn: string; price: number };
  quantity: number;
}
interface CartActionRemove {
  type: "remove";
  itemId: string;
  quantity: number;
}
type CartAction = CartActionAdd | CartActionRemove;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, restaurant_slug, cart, restaurant_id } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    const slug = restaurant_slug || "berlin-kontor";
    const restaurant = await getRestaurantBySlug(slug);
    const menuItems = restaurant ? await getDbMenuItems(restaurant.id) : [];
    const fallbackRestaurant = {
      id: restaurant_id || "rest_default",
      slug,
      nameFa: "کافه دیجیتال",
      nameEn: "Digital Café",
      descriptionFa: "",
      descriptionEn: "",
      themeConfig: {} as Record<string, string>,
      businessHours: {} as Record<string, { open: string; close: string }>,
      phone: "",
      address: { text: "" },
      cafePassword: "",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const agentKit = buildAgentKit(restaurant || fallbackRestaurant, menuItems);

    if (!apiKey) {
      const reply = `سلام! به ${agentKit.restaurant.nameFa} خوش آمدی 🎉

منوی ما:
${agentKit.menu}

ساعت کاری:
${agentKit.hours}

چطور می‌توانم کمکت کنم؟`;
      return Response.json({ reply, orderPlaced: false, cartActions: [] });
    }

    const cartInfo = Array.isArray(cart) && cart.length > 0
      ? `\n\nسبد خرید فعلی مشتری:\n${cart.map((c: CartItem) =>
          `- ${c.menuItem.nameFa} × ${c.quantity} = ${new Intl.NumberFormat("fa-IR").format(c.menuItem.price * c.quantity)} تومان`
        ).join("\n")}\nمجموع: ${new Intl.NumberFormat("fa-IR").format(cart.reduce((s: number, c: CartItem) => s + c.menuItem.price * c.quantity, 0))} تومان`
      : "";

    const systemPrompt = buildSystemPrompt(agentKit) + cartInfo + "\n\nپاسخ‌هایت خیلی کوتاه و سریع باشه. بدون تحلیل اضافی مستقیم جواب بده.";

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.role === "user" ? sanitizeMessage(m.content) : m.content,
    }));

    const lastMessages = sanitizedMessages.slice(-6);

    const addToCartTool = {
      type: "function" as const,
      function: {
        name: "add_to_cart",
        description: "آیتمی به سبد خرید مشتری اضافه کن. از شناسه (id) آیتم که در منو مشخص شده استفاده کن.",
        parameters: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "شناسه آیتم از منو (مثال: coffee, latte)" },
            quantity: { type: "number", description: "تعداد (پیش‌فرض ۱)" },
          },
          required: ["itemId"],
        },
      },
    };

    const removeFromCartTool = {
      type: "function" as const,
      function: {
        name: "remove_from_cart",
        description: "آیتمی از سبد خرید مشتری حذف کن.",
        parameters: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "شناسه آیتم" },
            quantity: { type: "number", description: "تعداد حذف (همه)" },
          },
          required: ["itemId"],
        },
      },
    };

    const createOrderTool = {
      type: "function" as const,
      function: {
        name: "create_order",
        description: "بعد از گرفتن شماره میز و تلفن از مشتری، سفارش نهایی را ثبت کن.",
        parameters: {
          type: "object",
          properties: {
            table: { type: "string", description: "شماره میز" },
            phone: { type: "string", description: "شماره موبایل مشتری" },
            customerName: { type: "string", description: "نام مشتری (اختیاری)" },
            notes: { type: "string", description: "توضیحات اضافی (اختیاری)" },
          },
          required: ["table", "phone"],
        },
      },
    };

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 25000);
    const onAbort = () => abortController.abort();
    request.signal.addEventListener("abort", onAbort, { once: true });

    let response: Response | undefined;
    const maxRetries = 2;
    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://menuchat.vercel.app",
            "X-Title": "Digital Cafe",
          },
          signal: abortController.signal,
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: systemPrompt }, ...lastMessages],
            tools: [addToCartTool, removeFromCartTool, createOrderTool],
            tool_choice: "auto",
            max_tokens: 500,
            temperature: 0.3,
          }),
        });
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = (attempt + 1) * 2000;
          await new Promise((r) => setTimeout(r, retryAfter));
          continue;
        }
        break;
      }
    } finally {
      clearTimeout(timeout);
      request.signal.removeEventListener("abort", onAbort);
    }

    if (!response || !response.ok) {
      console.error("AI API error:", response?.status);
      return Response.json({ reply: "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.", orderPlaced: false, cartActions: [] });
    }

    const data = await response.json();
    let fullContent = "";
    let orderPlaced = false;
    const cartActions: CartAction[] = [];

    if (data.choices?.[0]?.message?.content) {
      fullContent = data.choices[0].message.content;
    }

    if (data.choices?.[0]?.finish_reason === "tool_calls" && data.choices[0].message.tool_calls) {
      for (const tc of data.choices[0].message.tool_calls) {
        if (!tc.function?.name) continue;

        try {
          const args = JSON.parse(tc.function.arguments || "{}");

          if (tc.function.name === "add_to_cart") {
            const item = menuItems.find((m) => m.id === args.itemId);
            if (item) {
              cartActions.push({
                type: "add",
                item: { id: item.id, nameFa: item.nameFa, nameEn: item.nameEn, price: item.price },
                quantity: args.quantity || 1,
              });
            }
          }

          if (tc.function.name === "remove_from_cart") {
            cartActions.push({
              type: "remove",
              itemId: args.itemId,
              quantity: args.quantity || 9999,
            });
          }

          if (tc.function.name === "create_order" && Array.isArray(cart) && cart.length > 0) {
            const rid = restaurant?.id || restaurant_id || "rest_default";
            const order = await createOrder({
              restaurantId: rid,
              items: cart.map((c: CartItem) => ({
                id: c.menuItem.id,
                menuItemId: c.menuItem.id,
                nameFa: c.menuItem.nameFa,
                nameEn: c.menuItem.nameEn,
                price: c.menuItem.price,
                quantity: c.quantity,
                notes: "",
                totalPrice: c.menuItem.price * c.quantity,
              })),
              tableNumber: sanitizeTableNumber(args.table || ""),
              customerPhone: sanitizePhone(args.phone || ""),
              customerName: sanitizeMessage(args.customerName || ""),
              notes: sanitizeMessage(args.notes || ""),
              orderType: "dine_in",
            });
            if (order) {
              orderPlaced = true;
              cartActions.push({ type: "remove" as const, itemId: "*", quantity: 9999 });
              fullContent += `\n\n✅ سفارش #${order.id.slice(0, 8)} با موفقیت ثبت شد! آماده‌سازی شروع شده 🎉`;
            }
          }
        } catch (e) {
          console.error("Tool execution error:", e);
          fullContent += "\n\n❌ خطایی در ثبت سفارش رخ داد.";
        }
      }
    }

    if (!fullContent) {
      fullContent = "پاسخی دریافت نشد.";
    }

    return Response.json({ reply: fullContent, orderPlaced, cartActions });
  } catch (error) {
    console.error("AI route error:", error);
    return Response.json({ reply: "متأسفم، ارتباط با سرور برقرار نشد.", orderPlaced: false, cartActions: [] }, { status: 200 });
  }
}
