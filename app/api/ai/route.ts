import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json({
        reply:
          "⚠️ دستیار هوش مصنوعی در دسترس نیست. لطفاً بعداً تلاش کنید.",
      });
    }

    const systemPrompt = `تو یک دستیار دوستانه کافه هستی. منوی کافه:
- قهوه: ۱۳۵,۰۰۰ تومان
- کاپوچینو: ۱۴۵,۰۰۰ تومان
- لاته: ۱۴۸,۰۰۰ تومان
- کیک شکلاتی: ۱۵۵,۰۰۰ تومان
- ساندویچ مرغ: ۱۷۸,۰۰۰ تومان
- سالاد سزار: ۱۶۵,۰۰۰ تومان

پاسخ‌های کوتاه، بامزه و مفید بده. اگر کاربر چیزی سفارش داد، آیتم را تأیید کن و بپرس چیز دیگری نیاز دارد یا نه. مکالمه را طبیعی نگه دار.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
