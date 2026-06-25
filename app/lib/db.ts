import { getSupabase } from "./supabase";

export interface DbMenuItem {
  id: string;
  nameEn: string;
  nameFa: string;
  price: number;
  category: string;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  table: string;
  phone: string;
  status: OrderStatus;
  timestamp: number;
}

const inMemoryOrders = new Map<string, Order>();
const inMemoryMenuItems: DbMenuItem[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    items: row.items as OrderItem[],
    table: row.table_number as string,
    phone: row.phone,
    status: row.status as OrderStatus,
    timestamp: row.timestamp,
  };
}

function mapItemToDb(item: DbMenuItem) {
  return {
    id: item.id,
    name_en: item.nameEn,
    name_fa: item.nameFa,
    price: item.price,
    category: item.category,
  };
}

function mapRowToDbItem(row: any): DbMenuItem {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameFa: row.name_fa,
    price: row.price,
    category: row.category,
  };
}

export async function getOrders(): Promise<Order[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRowToOrder);
  }
  return Array.from(inMemoryOrders.values()).sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export async function createOrder(
  items: OrderItem[],
  table: string,
  phone: string
): Promise<Order> {
  const order: Order = {
    id: generateId(),
    items,
    table,
    phone,
    status: "pending",
    timestamp: Date.now(),
  };

  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("orders").insert({
      id: order.id,
      items: order.items,
      table_number: order.table,
      phone: order.phone,
      status: order.status,
      timestamp: order.timestamp,
    });
    if (error) throw error;
  } else {
    inMemoryOrders.set(order.id, order);
  }

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapRowToOrder(data) : null;
  }

  const order = inMemoryOrders.get(id);
  if (!order) return null;
  order.status = status;
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const { error, count } = await sb
      .from("orders")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  return inMemoryOrders.delete(id);
}

export async function getDbMenuItems(): Promise<DbMenuItem[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("menu_items").select("*");
    if (error) throw error;
    return (data || []).map(mapRowToDbItem);
  }
  return [...inMemoryMenuItems];
}

export async function saveDbMenuItems(items: DbMenuItem[]): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const dbItems = items.map(mapItemToDb);
    const { error } = await sb.from("menu_items").upsert(dbItems, {
      onConflict: "id",
      ignoreDuplicates: false,
    });
    if (error) throw error;
  } else {
    inMemoryMenuItems.length = 0;
    inMemoryMenuItems.push(...items);
  }
}
