import { NextRequest } from "next/server";
import { getRestaurantBySlug, getDbMenuItems, createOrder } from "@/lib/db";
import { buildAgentKit, buildSystemPrompt, sanitizeMessage, sanitizePhone, sanitizeTableNumber } from "@/lib/agent";

interface CartItem {
  menuItem: { id: string; nameFa: string; nameEn: string; price: number };
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, restaurant_slug, cart, restaurant_id } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      return new Response(`data: ${JSON.stringify({ reply })}\n\n`, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const cartInfo = Array.isArray(cart) && cart.length > 0
      ? `\n\nسبد خرید فعلی مشتری:\n${cart.map((c: CartItem) => `- ${c.menuItem.nameFa} × ${c.quantity} = ${new Intl.NumberFormat("fa-IR").format(c.menuItem.price * c.quantity)} تومان`).join("\n")}\nمجموع: ${new Intl.NumberFormat("fa-IR").format(cart.reduce((s: number, c: CartItem) => s + c.menuItem.price * c.quantity, 0))} تومان\nقبل از ثبت سفارش حتماً شماره میز و تلفن مشتری را بپرس.`
      : "";

    const systemPrompt = buildSystemPrompt(agentKit) + cartInfo + "\n\nپاسخ‌هایت خیلی کوتاه و سریع باشه. بدون تحلیل اضافی مستقیم جواب بده. از ایموجی‌های 🎉👍📱✅❌ استفاده کن.";

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.role === "user" ? sanitizeMessage(m.content) : m.content,
    }));

    const lastMessages = sanitizedMessages.slice(-6);

    const orderTool = {
      type: "function" as const,
      function: {
        name: "create_order",
        description: "بعد از گرفتن شماره میز و تلفن از مشتری، سفارش نهایی را ثبت کن. آیتم‌ها از سبد خرید فعلی مشتری گرفته می‌شوند.",
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

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://menuchat.vercel.app",
        "X-Title": "Digital Cafe",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...lastMessages],
        tools: [orderTool],
        tool_choice: "auto",
        max_tokens: 500,
        temperature: 0.3,
        stream: true,
        ...(model.includes("o3") || model.includes("o1") ? {} : {}),
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      const reply = "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      return new Response(`data: ${JSON.stringify({ reply })}\n\n`, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const stream = response.body;
    if (!stream) {
      const reply = "پاسخی دریافت نشد.";
      return new Response(`data: ${JSON.stringify({ reply })}\n\n`, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    let toolCallBuffer: { name: string; arguments: string; id: string } | null = null;
    let orderPlaced = false;

    const enqueue = (controller: ReadableStreamDefaultController, data: string) => {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ reply: data })}\n\n`));
    };
    const endStream = (controller: ReadableStreamDefaultController) => {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ orderPlaced })}\n\n`));
      controller.close();
    };

    const readable = new ReadableStream({
      start: async (controller) => {
        try {
          let done = false;
          while (!done) {
            const result = await reader.read();
            done = result.done;
            if (result.value) {
              buffer += decoder.decode(result.value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;
                const data = trimmed.slice(6).trim();
                if (data === "[DONE]") { done = true; break; }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;
                  const finishReason = parsed.choices?.[0]?.finish_reason;

                  if (delta?.content) {
                    fullContent += delta.content;
                    enqueue(controller, fullContent);
                  }

                  if (delta?.tool_calls) {
                    for (const tc of delta.tool_calls) {
                      if (tc.function?.name) {
                        toolCallBuffer = { name: tc.function.name, arguments: tc.function.arguments || "", id: tc.id || "" };
                      } else if (toolCallBuffer && tc.function?.arguments) {
                        toolCallBuffer.arguments += tc.function.arguments;
                      }
                    }
                  }

                  if (finishReason === "tool_calls" && toolCallBuffer) {
                    try {
                      const args = JSON.parse(toolCallBuffer.arguments);
                      if (toolCallBuffer.name === "create_order" && Array.isArray(cart) && cart.length > 0) {
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
                          fullContent += `\n\n✅ سفارش #${order.id.slice(0, 8)} با موفقیت ثبت شد! آماده‌سازی شروع شده 🎉`;
                          enqueue(controller, fullContent);
                        } else {
                          fullContent += "\n\n❌ متأسفم، خطایی در ثبت سفارش رخ داد.";
                          enqueue(controller, fullContent);
                        }
                      } else if (toolCallBuffer.name === "create_order") {
                        fullContent += "\n\n🤔 سبد خریدت خالی است. لطفاً اول آیتم‌های مورد نظرت را از منو انتخاب کن.";
                        enqueue(controller, fullContent);
                      }
                    } catch (e) {
                      console.error("Tool execution error:", e);
                      fullContent += "\n\n❌ خطایی در ثبت سفارش رخ داد.";
                      enqueue(controller, fullContent);
                    }
                    toolCallBuffer = null;
                  }
                } catch {
                  // JSON parse error - skip malformed line
                }
              }
            }
          }

          if (!fullContent) {
            const reply = "پاسخی دریافت نشد.";
            enqueue(controller, reply);
          }

          endStream(controller);
        } catch (e) {
          console.error("Stream error:", e);
          const reply = "متأسفم، خطایی در پردازش پاسخ رخ داد.";
          enqueue(controller, reply);
          endStream(controller);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    const reply = "متأسفم، ارتباط با سرور برقرار نشد.";
    return new Response(`data: ${JSON.stringify({ reply })}\ndata: {"orderPlaced":false}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }
}
