export interface MenuItem {
  id: string;
  nameEn: string;
  nameFa: string;
  price: number;
  category: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "coffee",
    nameEn: "Coffee",
    nameFa: "قهوه",
    price: 135000,
    category: "نوشیدنی گرم",
  },
  {
    id: "cappuccino",
    nameEn: "Cappuccino",
    nameFa: "کاپوچینو",
    price: 145000,
    category: "نوشیدنی گرم",
  },
  {
    id: "latte",
    nameEn: "Latte",
    nameFa: "لاته",
    price: 148000,
    category: "نوشیدنی گرم",
  },
  {
    id: "chocolate-cake",
    nameEn: "Chocolate Cake",
    nameFa: "کیک شکلاتی",
    price: 155000,
    category: "دسر",
  },
  {
    id: "chicken-sandwich",
    nameEn: "Chicken Sandwich",
    nameFa: "ساندویچ مرغ",
    price: 178000,
    category: "غذا",
  },
  {
    id: "caesar-salad",
    nameEn: "Caesar Salad",
    nameFa: "سالاد سزار",
    price: 165000,
    category: "غذا",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export function getMenuByCategory(): Record<string, MenuItem[]> {
  const categories: Record<string, MenuItem[]> = {};
  for (const item of menuItems) {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  }
  return categories;
}
