export async function getAIResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY || "";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return "⚠️ متأسفم، دستیار هوش مصنوعی در دسترس نیست. لطفاً بعداً تلاش کنید.";
  }

  const systemPrompt = `تو یک دستیار دوستانه کافه هستی. منوی کافه:
- قهوه: ۱۳۵,۰۰۰ تومان
- کاپوچینو: ۱۴۵,۰۰۰ تومان
- لاته: ۱۴۸,۰۰۰ تومان
- کیک شکلاتی: ۱۵۵,۰۰۰ تومان
- ساندویچ مرغ: ۱۷۸,۰۰۰ تومان
- سالاد سزار: ۱۶۵,۰۰۰ تومان

پاسخ‌های کوتاه، بامزه و مفید بده. اگر کاربر چیزی سفارش داد، آیتم را تأیید کن و بپرس چیز دیگری نیاز دارد یا نه. مکالمه را طبیعی نگه دار.`;

  try {
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
      console.error("AI API error:", response.status, await response.text());
      return "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";
  } catch (error) {
    console.error("AI fetch error:", error);
    return "متأسفم، ارتباط با سرور برقرار نشد.";
  }
}
