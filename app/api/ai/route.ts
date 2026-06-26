import { NextRequest, NextResponse } from "next/server";
import { getRestaurantBySlug, getDbMenuItems } from "@/lib/db";
import { buildAgentKit, buildSystemPrompt, sanitizeMessage } from "@/lib/agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, restaurant_slug } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    const slug = restaurant_slug || "berlin-kontor";
    const restaurant = await getRestaurantBySlug(slug);
    const menuItems = restaurant ? await getDbMenuItems(restaurant.id) : [];
    const agentKit = buildAgentKit(
      restaurant || {
        id: "rest_default",
        slug: "berlin-kontor",
        nameFa: "کافه دیجیتال",
        nameEn: "Digital Café",
        descriptionFa: "",
        descriptionEn: "",
        themeConfig: {},
        businessHours: {},
        phone: "",
        address: { text: "" },
        cafePassword: "",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      menuItems,
    );

    const systemPrompt = buildSystemPrompt(agentKit);

    if (!apiKey) {
      return NextResponse.json({
        reply: `سلام! به ${agentKit.restaurant.nameFa} خوش آمدی 🎉\n\nمنوی ما:\n${agentKit.menu}\n\nساعت کاری:\n${agentKit.hours}\n\nچطور می‌توانم کمکت کنم؟`,
      });
    }

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.role === "user" ? sanitizeMessage(m.content) : m.content,
    }));

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return NextResponse.json(
        { reply: "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید." },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { reply: "متأسفم، ارتباط با سرور برقرار نشد." },
      { status: 200 }
    );
  }
}
