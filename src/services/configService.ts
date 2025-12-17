import { MenuConfig } from "@/data/menuConfig";
import { CheckoutConfig } from "@/data/checkoutConfig";
import { Order } from "@/data/ordersConfig";

export interface DesignConfig {
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  socialLinks: Array<{ platform: string; url: string; icon: string }>;
  colors: {
    primary: string;
    background: string;
    card: string;
    accent: string;
    border: string;
    text: string;
    heading: string;
    muted: string;
  };
  fonts: {
    display: string;
    body: string;
    price: string;
    button: string;
    nav: string;
  };
  customFonts: Array<{ name: string; url: string }>;
}

const defaultDesignConfig: DesignConfig = {
  storeName: "MilkShakes",
  storeDescription: "Os melhores milkshakes da cidade",
  storeLogo: "",
  socialLinks: [],
  colors: {
    primary: "#ec4899",
    background: "#fdf2f8",
    card: "#ffffff",
    accent: "#f472b6",
    border: "#fbcfe8",
    text: "#1f2937",
    heading: "#111827",
    muted: "#6b7280",
  },
  fonts: {
    display: "Pacifico",
    body: "Poppins",
    price: "Poppins",
    button: "Poppins",
    nav: "Poppins",
  },
  customFonts: [],
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export const ConfigService = {
  async getMenuConfig(): Promise<MenuConfig> {
    try {
      return await apiRequest<MenuConfig>('/api/menu-config');
    } catch (error) {
      console.error("Error fetching menu config:", error);
      return {
        menuItems: [],
        extras: [],
        categories: [],
        drinkOptions: [],
        acaiTurbine: [],
      };
    }
  },

  async saveMenuConfig(config: MenuConfig): Promise<void> {
    try {
      await apiRequest('/api/menu-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error("Error saving menu config:", error);
      throw error;
    }
  },

  async resetMenuConfig(): Promise<MenuConfig> {
    const defaultConfig: MenuConfig = {
      menuItems: [],
      extras: [],
      categories: [],
      drinkOptions: [],
      acaiTurbine: [],
    };
    await this.saveMenuConfig(defaultConfig);
    return defaultConfig;
  },

  async getCheckoutConfig(): Promise<CheckoutConfig> {
    try {
      return await apiRequest<CheckoutConfig>('/api/checkout-config');
    } catch (error) {
      console.error("Error fetching checkout config:", error);
      return { steps: [] };
    }
  },

  async saveCheckoutConfig(config: CheckoutConfig): Promise<void> {
    try {
      await apiRequest('/api/checkout-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error("Error saving checkout config:", error);
      throw error;
    }
  },

  async resetCheckoutConfig(): Promise<CheckoutConfig> {
    const defaultConfig: CheckoutConfig = { steps: [] };
    await this.saveCheckoutConfig(defaultConfig);
    return defaultConfig;
  },

  async getDesignConfig(): Promise<DesignConfig> {
    try {
      const config = await apiRequest<DesignConfig>('/api/design-config');
      return { ...defaultDesignConfig, ...config };
    } catch (error) {
      console.error("Error fetching design config:", error);
      return defaultDesignConfig;
    }
  },

  async saveDesignConfig(config: DesignConfig): Promise<void> {
    try {
      await apiRequest('/api/design-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error("Error saving design config:", error);
      throw error;
    }
  },

  async resetDesignConfig(): Promise<DesignConfig> {
    await this.saveDesignConfig(defaultDesignConfig);
    return defaultDesignConfig;
  },

  async getOrders(): Promise<Order[]> {
    try {
      const orders = await apiRequest<any[]>('/api/orders');
      return orders.map(order => ({
        id: order.orderId,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone || "",
        deliveryType: order.deliveryType,
        tableNumber: order.tableNumber,
        address: order.address,
        items: order.items,
        extras: order.extras || [],
        drink: order.drink,
        total: parseFloat(order.total),
        status: order.status,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async createOrder(order: Order): Promise<void> {
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone || "",
          deliveryType: order.deliveryType,
          tableNumber: order.tableNumber,
          address: order.address,
          items: order.items,
          extras: order.extras || [],
          drink: order.drink,
          total: order.total.toString(),
          status: order.status,
        }),
      });
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await apiRequest(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async deleteImage(imageUrl: string): Promise<void> {
    console.log("Image deletion not implemented:", imageUrl);
  },

  async exportAllConfig(): Promise<string> {
    const [menuConfig, checkoutConfig, designConfig, orders] = await Promise.all([
      this.getMenuConfig(),
      this.getCheckoutConfig(),
      this.getDesignConfig(),
      this.getOrders(),
    ]);

    const fullConfig = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      menu: menuConfig,
      checkout: checkoutConfig,
      design: designConfig,
      orders: orders,
    };

    return JSON.stringify(fullConfig, null, 2);
  },

  async importAllConfig(jsonString: string): Promise<void> {
    try {
      const config = JSON.parse(jsonString);
      
      if (config.menu) {
        await this.saveMenuConfig(config.menu);
      }
      if (config.checkout) {
        await this.saveCheckoutConfig(config.checkout);
      }
      if (config.design) {
        await this.saveDesignConfig(config.design);
      }
    } catch (error) {
      console.error("Error importing config:", error);
      throw new Error("Arquivo JSON inválido");
    }
  },
};

export type { MenuConfig, CheckoutConfig, Order };
export { defaultDesignConfig };
