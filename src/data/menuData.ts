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
  selectedSize: string;
  selectedPrice: number;
  quantity: number;
}

export const menuCategories: { id: string; name: string; color: string }[] = [];

export const menuItems: MenuItem[] = [];

export const extras: { id: string; name: string; price: number; stock?: number }[] = [];

export const acaiTurbine: string[] = [];
