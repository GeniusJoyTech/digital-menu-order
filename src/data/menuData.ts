export interface MenuItem {
  id: string;
  name: string;
  description: string;
  prices: {
    size: string;
    price: number;
  }[];
  category: string;
  image: string;
  stock?: number; // undefined = ilimitado, 0 = esgotado
}

export interface CartItem extends MenuItem {
  instanceId: string; // Unique ID for each individual item instance
  selectedSize: string;
  selectedPrice: number;
  recipientName?: string; // Optional per-item recipient name
}

export const menuCategories: { id: string; name: string; color: string }[] = [];

export const menuItems: MenuItem[] = [];

export const extras: { id: string; name: string; price: number; stock?: number }[] = [];

export const acaiTurbine: string[] = [];
