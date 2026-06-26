import type { Restaurant, DbMenuItem } from "@/lib/db";

export interface AgentKit {
  restaurant: Restaurant;
  menu: string;
  hours: string;
  currentTime: string;
}

export function buildAgentKit(
  restaurant: Restaurant,
  menuItems: DbMenuItem[],
): AgentKit {
  const menuStr = menuItems.length > 0
    ? menuItems.map(i =>
        `${i.nameFa} (${i.nameEn}): ${i.price.toLocaleString("fa-IR")} تومان` +
        (i.isAvailable ? "" : " ❌ ناموجود")
      ).join("\n")
    : "منوی پیش‌فرض";

  const hoursStr = restaurant.businessHours
    ? Object.entries(restaurant.businessHours)
        .map(([day, h]) => {
          const dayNames: Record<string, string> = {
            sat: "شنبه", sun: "یکشنبه", mon: "دوشنبه", tue: "سه‌شنبه",
            wed: "چهارشنبه", thu: "پنجشنبه", fri: "جمعه",
          };
          return `${dayNames[day] || day}: ${h.open} - ${h.close}`;
        }).join("\n")
    : "همه روزه ۰۸:۰۰ - ۲۳:۰۰";

  return {
    restaurant,
    menu: menuStr,
    hours: hoursStr,
    currentTime: new Date().toLocaleString("fa-IR"),
  };
}

export function buildSystemPrompt(kit: AgentKit): string {
  return `شما دستیار هوشمند ${kit.restaurant.nameFa} هستید.

## مشخصات رستوران
- نام: ${kit.restaurant.nameFa} (${kit.restaurant.nameEn})
- توضیحات: ${kit.restaurant.descriptionFa || "کافه‌ای دنج و مدرن"}
- ساعت کاری:
${kit.hours}
- زمان فعلی: ${kit.currentTime}

## منو
${kit.menu}

## شخصیت
- گرم، صمیمی و خوش‌برخورد
- از اصطلاحات محاوره‌ای و دوستانه استفاده کن
- پاسخ‌ها کوتاه و مفید باشند (حداکثر ۲-۳ جمله)
- اگر کاربر درخواست سفارش داد، آیتم‌ها را تأیید کن و بپرس چیز دیگری نیاز دارد یا نه
- اگر آیتمی در منو نیست، پیشنهاد مشابه بده
- همیشه به فارسی روان صحبت کن
- هرگز اطلاعات نادرست درباره منو نده
- اگر کاربر سوالی درباره مواد تشکیل‌دهنده یا آلرژن‌ها پرسید، بگو اطلاعات دقیق را از اپراتور بپرسد`;
}
