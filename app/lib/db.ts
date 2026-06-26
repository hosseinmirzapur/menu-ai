import { getSupabase } from "./supabase";
import { hashPassword } from "./auth";
import bcrypt from "bcryptjs";

export interface Restaurant {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  themeConfig: Record<string, string>;
  businessHours: Record<string, { open: string; close: string }>;
  phone: string;
  address: { text: string; lat?: number; lng?: number };
  cafePassword: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DbMenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  nameEn: string;
  nameFa: string;
  descriptionFa: string;
  descriptionEn: string;
  price: number;
  cost: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  preparationTime: number;
  dietaryTags: string[];
  createdAt: number;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  nameFa: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";
export type OrderType = "dine_in" | "takeaway" | "delivery";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface OrderItem {
  id: string;
  menuItemId: string;
  nameFa: string;
  nameEn: string;
  price: number;
  quantity: number;
  notes: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerPhone: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes: string;
  timestamp: number;
}

const inMemoryRestaurants = new Map<string, Restaurant>();
const inMemoryOrders = new Map<string, Order>();
const inMemoryMenuItems: DbMenuItem[] = [];
const inMemoryCategories = new Map<string, MenuCategory>();

function ensureDefaultRestaurant() {
  if (inMemoryRestaurants.size === 0) {
    const id = "rest_default";
    inMemoryRestaurants.set(id, {
      id,
      slug: "berlin-kontor",
      nameFa: "کافه دیجیتال",
      nameEn: "Digital Café",
      descriptionFa: "کافه‌ای به سبک اروپایی",
      descriptionEn: "A European-style café",
      themeConfig: {
        "--bg-base": "#0C0A09",
        "--bg-surface": "#1C1917",
        "--bg-elevated": "#292524",
        "--border-subtle": "#3D352D",
        "--text-primary": "#EDE4D8",
        "--text-secondary": "#C4A88A",
        "--text-muted": "#8B7355",
        "--danger": "#9F391B",
        "--success": "#5A7A5A",
      },
      businessHours: {
        sat: { open: "08:00", close: "23:00" },
        sun: { open: "08:00", close: "23:00" },
        mon: { open: "08:00", close: "23:00" },
        tue: { open: "08:00", close: "23:00" },
        wed: { open: "08:00", close: "23:00" },
        thu: { open: "08:00", close: "23:00" },
        fri: { open: "10:00", close: "22:00" },
      },
      phone: "",
      address: { text: "" },
      cafePassword: bcrypt.hashSync("cafe123", 10),
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Restaurant CRUD ────────────────────────────────────────────────

export async function getRestaurants(): Promise<Restaurant[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("restaurants").select("*").eq("is_active", true);
    if (error) throw error;
    return (data || []).map(mapRowToRestaurant);
  }
  ensureDefaultRestaurant();
  return Array.from(inMemoryRestaurants.values());
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("restaurants").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapRowToRestaurant(data) : null;
  }
  ensureDefaultRestaurant();
  for (const r of Array.from(inMemoryRestaurants.values())) {
    if (r.slug === slug) return r;
  }
  return null;
}

export async function createRestaurant(input: Omit<Restaurant, "id" | "createdAt" | "updatedAt">): Promise<Restaurant> {
  const restaurant: Restaurant = {
    id: generateId(),
    ...input,
    cafePassword: input.cafePassword ? await hashPassword(input.cafePassword) : "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("restaurants").insert({
      id: restaurant.id,
      slug: restaurant.slug,
      name_fa: restaurant.nameFa,
      name_en: restaurant.nameEn,
      description_fa: restaurant.descriptionFa,
      description_en: restaurant.descriptionEn,
      theme_config: restaurant.themeConfig,
      business_hours: restaurant.businessHours,
      phone: restaurant.phone,
      address: restaurant.address,
      cafe_password: restaurant.cafePassword,
      is_active: restaurant.isActive,
    });
    if (error) throw error;
  } else {
    inMemoryRestaurants.set(restaurant.id, restaurant);
  }

  return restaurant;
}

export async function updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
  const sb = getSupabase();
  if (sb) {
    const dbUpdates: Record<string, any> = {};
    if (updates.nameFa !== undefined) dbUpdates.name_fa = updates.nameFa;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.descriptionFa !== undefined) dbUpdates.description_fa = updates.descriptionFa;
    if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
    if (updates.themeConfig !== undefined) dbUpdates.theme_config = updates.themeConfig;
    if (updates.businessHours !== undefined) dbUpdates.business_hours = updates.businessHours;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.cafePassword !== undefined) dbUpdates.cafe_password = await hashPassword(updates.cafePassword);
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await sb.from("restaurants").update(dbUpdates).eq("id", id).select("*").single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapRowToRestaurant(data) : null;
  }

  const existing = inMemoryRestaurants.get(id);
  if (!existing) return null;
  const updatedUpdates = { ...updates };
  if (updates.cafePassword !== undefined) {
    updatedUpdates.cafePassword = await hashPassword(updates.cafePassword);
  }
  Object.assign(existing, updatedUpdates, { updatedAt: Date.now() });
  return existing;
}

// ─── Menu Categories ────────────────────────────────────────────────

export async function getCategories(restaurantId: string): Promise<MenuCategory[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("menu_categories").select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      restaurantId: r.restaurant_id,
      nameFa: r.name_fa,
      nameEn: r.name_en,
      sortOrder: r.sort_order,
      isActive: r.is_active,
    }));
  }
  return Array.from(inMemoryCategories.values()).filter(c => c.restaurantId === restaurantId);
}

export async function saveCategories(restaurantId: string, categories: MenuCategory[]): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const dbItems = categories.map(c => ({
      id: c.id,
      restaurant_id: restaurantId,
      name_fa: c.nameFa,
      name_en: c.nameEn,
      sort_order: c.sortOrder,
      is_active: c.isActive,
    }));
    const { error } = await sb.from("menu_categories").upsert(dbItems, { onConflict: "id", ignoreDuplicates: false });
    if (error) throw error;
  } else {
    for (const c of categories) {
      inMemoryCategories.set(c.id, c);
    }
  }
}

export async function deleteCategory(restaurantId: string, categoryId: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const { error, count } = await sb.from("menu_categories").delete({ count: "exact" })
      .eq("id", categoryId).eq("restaurant_id", restaurantId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  return inMemoryCategories.delete(categoryId);
}

// ─── Menu Items (multi-restaurant) ──────────────────────────────────

export async function getDbMenuItems(restaurantId?: string): Promise<DbMenuItem[]> {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from("menu_items").select("*");
    if (restaurantId) query = query.eq("restaurant_id", restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapRowToDbItem);
  }
  if (restaurantId) return inMemoryMenuItems.filter(i => i.restaurantId === restaurantId);
  return [...inMemoryMenuItems];
}

export async function saveDbMenuItems(restaurantId: string, items: DbMenuItem[]): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const dbItems = items.map(i => ({
      id: i.id,
      restaurant_id: restaurantId,
      category_id: i.categoryId,
      name_en: i.nameEn,
      name_fa: i.nameFa,
      description_fa: i.descriptionFa,
      description_en: i.descriptionEn,
      price: i.price,
      cost: i.cost,
      is_available: i.isAvailable,
      is_featured: i.isFeatured,
      sort_order: i.sortOrder,
      preparation_time: i.preparationTime,
      dietary_tags: i.dietaryTags,
    }));
    const { error } = await sb.from("menu_items").upsert(dbItems, { onConflict: "id", ignoreDuplicates: false });
    if (error) throw error;
  } else {
    const filtered = inMemoryMenuItems.filter(i => i.restaurantId !== restaurantId);
    inMemoryMenuItems.length = 0;
    inMemoryMenuItems.push(...filtered, ...items);
  }
}

export async function deleteDbMenuItem(restaurantId: string, itemId: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const { error, count } = await sb.from("menu_items").delete({ count: "exact" })
      .eq("id", itemId).eq("restaurant_id", restaurantId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
  const idx = inMemoryMenuItems.findIndex(i => i.id === itemId && i.restaurantId === restaurantId);
  if (idx === -1) return false;
  inMemoryMenuItems.splice(idx, 1);
  return true;
}

// ─── Orders (multi-restaurant) ──────────────────────────────────────

export async function getOrders(restaurantId?: string): Promise<Order[]> {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from("orders").select("*").order("timestamp", { ascending: false });
    if (restaurantId) query = query.eq("restaurant_id", restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapRowToOrder);
  }
  let orders = Array.from(inMemoryOrders.values());
  if (restaurantId) orders = orders.filter(o => o.restaurantId === restaurantId);
  return orders.sort((a, b) => b.timestamp - a.timestamp);
}

export async function createOrder(input: {
  restaurantId: string;
  items: OrderItem[];
  tableNumber: string;
  customerPhone: string;
  customerName: string;
  orderType: OrderType;
  notes: string;
}): Promise<Order> {
  const totalAmount = input.items.reduce((s, i) => s + i.totalPrice, 0);
  const order: Order = {
    id: generateId(),
    ...input,
    status: "pending",
    paymentStatus: "pending",
    totalAmount,
    timestamp: Date.now(),
  };

  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("orders").insert({
      id: order.id,
      restaurant_id: order.restaurantId,
      customer_phone: order.customerPhone,
      customer_name: order.customerName,
      table_number: order.tableNumber,
      items: order.items,
      status: order.status,
      order_type: order.orderType,
      payment_status: order.paymentStatus,
      total_amount: order.totalAmount,
      notes: order.notes,
      timestamp: order.timestamp,
    });
    if (error) throw error;
  } else {
    inMemoryOrders.set(order.id, order);
  }

  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus, restaurantId?: string): Promise<Order | null> {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from("orders").update({ status }).eq("id", id).select("*");
    if (restaurantId) query = query.eq("restaurant_id", restaurantId) as any;
    const { data, error } = await query.single() as any;
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapRowToOrder(data) : null;
  }

  const order = inMemoryOrders.get(id);
  if (!order || (restaurantId && order.restaurantId !== restaurantId)) return null;
  order.status = status;
  return order;
}

export async function deleteOrder(id: string, restaurantId?: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    let query = sb.from("orders").delete({ count: "exact" }).eq("id", id);
    if (restaurantId) query = query.eq("restaurant_id", restaurantId) as any;
    const { error, count } = await query as any;
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  const order = inMemoryOrders.get(id);
  if (!order || (restaurantId && order.restaurantId !== restaurantId)) return false;
  return inMemoryOrders.delete(id);
}

// ─── Mappers ────────────────────────────────────────────────────────

function mapRowToRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    slug: row.slug,
    nameFa: row.name_fa,
    nameEn: row.name_en,
    descriptionFa: row.description_fa || "",
    descriptionEn: row.description_en || "",
    themeConfig: row.theme_config || {},
    businessHours: row.business_hours || {},
    phone: row.phone || "",
    address: row.address || { text: "" },
    cafePassword: row.cafe_password || "",
    isActive: row.is_active !== false,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    customerPhone: row.customer_phone || row.phone || "",
    customerName: row.customer_name || "",
    tableNumber: row.table_number || "",
    items: (row.items || []).map((i: any) => ({
      id: i.id || i.menuItemId,
      menuItemId: i.menuItemId || i.id,
      nameFa: i.nameFa || i.name || "",
      nameEn: i.nameEn || i.name || "",
      price: i.price,
      quantity: i.quantity,
      notes: i.notes || "",
      totalPrice: i.totalPrice || i.price * i.quantity,
    })),
    status: row.status || "pending",
    orderType: row.order_type || "dine_in",
    paymentStatus: row.payment_status || "pending",
    totalAmount: row.total_amount || 0,
    notes: row.notes || "",
    timestamp: typeof row.timestamp === "number" ? row.timestamp : Date.now(),
  };
}

function mapRowToDbItem(row: any): DbMenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id || "",
    nameEn: row.name_en,
    nameFa: row.name_fa,
    descriptionFa: row.description_fa || "",
    descriptionEn: row.description_en || "",
    price: row.price,
    cost: row.cost || 0,
    isAvailable: row.is_available !== false,
    isFeatured: row.is_featured || false,
    sortOrder: row.sort_order || 0,
    preparationTime: row.preparation_time || 0,
    dietaryTags: row.dietary_tags || [],
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}
