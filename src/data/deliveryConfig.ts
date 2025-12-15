export interface DeliveryTracking {
  id: string;
  orderId: string;
  customerName: string;
  status: "preparing" | "on_the_way" | "arriving" | "delivered";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "shakeyes_deliveries";

export const loadDeliveries = (): DeliveryTracking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading deliveries:", error);
  }
  return [];
};

export const saveDelivery = (delivery: DeliveryTracking): void => {
  try {
    const deliveries = loadDeliveries();
    const existingIndex = deliveries.findIndex(d => d.id === delivery.id);
    
    if (existingIndex >= 0) {
      deliveries[existingIndex] = delivery;
    } else {
      deliveries.push(delivery);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  } catch (error) {
    console.error("Error saving delivery:", error);
  }
};

export const getDelivery = (id: string): DeliveryTracking | null => {
  const deliveries = loadDeliveries();
  return deliveries.find(d => d.id === id) || null;
};

export const updateDeliveryStatus = (id: string, status: DeliveryTracking["status"]): DeliveryTracking | null => {
  const deliveries = loadDeliveries();
  const delivery = deliveries.find(d => d.id === id);
  
  if (delivery) {
    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    return delivery;
  }
  
  return null;
};

export const createDeliveryTracking = (orderId: string, customerName: string): DeliveryTracking => {
  const delivery: DeliveryTracking = {
    id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderId,
    customerName,
    status: "preparing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveDelivery(delivery);
  return delivery;
};

export const getDeliveryByOrderId = (orderId: string): DeliveryTracking | null => {
  const deliveries = loadDeliveries();
  return deliveries.find(d => d.orderId === orderId) || null;
};
