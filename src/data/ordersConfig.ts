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

export const loadOrders = (): Order[] => {
  return [];
};

export const saveOrder = (order: Order): void => {
  console.log("Order saved to API");
};

export const updateOrderStatus = (orderId: string, status: Order["status"]): void => {
  console.log("Order status updated via API");
};

export const deleteOrder = (orderId: string): void => {
  console.log("Order deleted via API");
};

export const deleteOldOrders = (daysOld: number = 30): number => {
  return 0;
};
