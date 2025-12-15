export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup" | "table";
  tableNumber?: string;
  address?: string;
  items: OrderItem[];
  extras: { name: string; price: number }[];
  drink: { name: string; price: number } | null;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
}

const STORAGE_KEY = "shakeyes_orders";

export const loadOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  }
  return [];
};

export const saveOrder = (order: Order): void => {
  try {
    const orders = loadOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving order:", error);
  }
};

export const updateOrderStatus = (orderId: string, status: Order["status"]): void => {
  try {
    const orders = loadOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

export const deleteOrder = (orderId: string): void => {
  try {
    const orders = loadOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting order:", error);
  }
};

export const deleteOldOrders = (daysOld: number = 30): number => {
  try {
    const orders = loadOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filtered = orders.filter(o => new Date(o.createdAt) >= cutoffDate);
    const deletedCount = orders.length - filtered.length;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return deletedCount;
  } catch (error) {
    console.error("Error deleting old orders:", error);
    return 0;
  }
};
