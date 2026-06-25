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

interface KvClient {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: any) => Promise<void>;
}

let kvClient: KvClient | null = null;

async function getKvClient(): Promise<KvClient | null> {
  if (kvClient !== null) return kvClient;
  if (process.env.KV_URL) {
    try {
      const mod = await import("@vercel/kv");
      kvClient = mod.kv as unknown as KvClient;
      return kvClient;
    } catch {
      kvClient = null;
    }
  }
  return null;
}

const inMemoryStore = new Map<string, Order>();
const inMemoryMenuStore: DbMenuItem[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function getOrders(): Promise<Order[]> {
  const kv = await getKvClient();
  if (kv) {
    const orders = await kv.get<Order[]>("orders");
    return orders || [];
  }
  return Array.from(inMemoryStore.values()).sort(
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

  const kv = await getKvClient();
  if (kv) {
    const orders = await getOrders();
    orders.unshift(order);
    await kv.set("orders", orders);
  } else {
    inMemoryStore.set(order.id, order);
  }

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const kv = await getKvClient();
  if (kv) {
    const orders = await getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    orders[index].status = status;
    await kv.set("orders", orders);
    return orders[index];
  }

  const order = inMemoryStore.get(id);
  if (!order) return null;
  order.status = status;
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const kv = await getKvClient();
  if (kv) {
    const orders = await getOrders();
    const filtered = orders.filter((o) => o.id !== id);
    await kv.set("orders", filtered);
    return filtered.length !== orders.length;
  }

  return inMemoryStore.delete(id);
}

export async function getDbMenuItems(): Promise<DbMenuItem[]> {
  const kv = await getKvClient();
  if (kv) {
    const items = await kv.get<DbMenuItem[]>("menu_items");
    return items || [];
  }
  return [...inMemoryMenuStore];
}

export async function saveDbMenuItems(items: DbMenuItem[]): Promise<void> {
  const kv = await getKvClient();
  if (kv) {
    await kv.set("menu_items", items);
  } else {
    inMemoryMenuStore.length = 0;
    inMemoryMenuStore.push(...items);
  }
}
