export interface MenuItem {
  id: string;
  nameEn: string;
  nameFa: string;
  price: number;
  category: string;
  image?: string;
}

const RESTAURANT_MENUS: Record<string, MenuItem[]> = {
  "berlin-kontor": [
    { id: "coffee", nameEn: "Coffee", nameFa: "قهوه", price: 135000, category: "نوشیدنی گرم", image: "/images/coffee.png" },
    { id: "cappuccino", nameEn: "Cappuccino", nameFa: "کاپوچینو", price: 145000, category: "نوشیدنی گرم", image: "/images/cappuccino.png" },
    { id: "latte", nameEn: "Latte", nameFa: "لاته", price: 148000, category: "نوشیدنی گرم", image: "/images/latte.png" },
    { id: "espresso", nameEn: "Espresso", nameFa: "اسپرسو", price: 120000, category: "نوشیدنی گرم", image: "/images/espresso.png" },
    { id: "mocha", nameEn: "Mocha", nameFa: "موکا", price: 158000, category: "نوشیدنی گرم", image: "/images/mocha.png" },
    { id: "cold-brew", nameEn: "Cold Brew", nameFa: "کولد برو", price: 142000, category: "نوشیدنی سرد", image: "/images/cold-brew.png" },
    { id: "iced-latte", nameEn: "Iced Latte", nameFa: "آیس لاته", price: 152000, category: "نوشیدنی سرد", image: "/images/iced-latte.png" },
    { id: "lemonade", nameEn: "Lemonade", nameFa: "لیموناد", price: 98000, category: "نوشیدنی سرد", image: "/images/lemonade.png" },
    { id: "chocolate-cake", nameEn: "Chocolate Cake", nameFa: "کیک شکلاتی", price: 155000, category: "دسر", image: "/images/chocolate-cake.png" },
    { id: "cheesecake", nameEn: "Cheesecake", nameFa: "چیزکیک", price: 168000, category: "دسر", image: "/images/cheesecake.png" },
    { id: "tiramisu", nameEn: "Tiramisu", nameFa: "تیرامیسو", price: 175000, category: "دسر", image: "/images/tiramisu.png" },
    { id: "chicken-sandwich", nameEn: "Chicken Sandwich", nameFa: "ساندویچ مرغ", price: 178000, category: "غذا", image: "/images/chicken-sandwich.png" },
    { id: "caesar-salad", nameEn: "Caesar Salad", nameFa: "سالاد سزار", price: 165000, category: "غذا", image: "/images/caesar-salad.png" },
    { id: "club-sandwich", nameEn: "Club Sandwich", nameFa: "ساندویچ کلاب", price: 185000, category: "غذا", image: "/images/club-sandwich.png" },
    { id: "french-fries", nameEn: "French Fries", nameFa: "سیب‌زمینی سرخ کرده", price: 85000, category: "پیش‌غذا", image: "/images/french-fries.png" },
    { id: "onion-rings", nameEn: "Onion Rings", nameFa: "حلقه‌های پیاز", price: 95000, category: "پیش‌غذا", image: "/images/onion-rings.png" },
  ],
};

export { RESTAURANT_MENUS as menuItems };

export function getMenuItems(restaurantSlug: string): MenuItem[] {
  return RESTAURANT_MENUS[restaurantSlug] || RESTAURANT_MENUS["berlin-kontor"] || [];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export function getMenuByCategory(restaurantSlug: string): Record<string, MenuItem[]> {
  const items = getMenuItems(restaurantSlug);
  const categories: Record<string, MenuItem[]> = {};
  for (const item of items) {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  }
  return categories;
}
