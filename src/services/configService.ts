/**
 * Configuration Service
 * 
 * This service manages all JSON configuration data.
 * Currently uses localStorage, but is designed to easily switch to an external API.
 * 
 * To connect to an external backend, replace the localStorage calls with fetch() calls
 * to your API endpoint.
 */

import { MenuConfig, loadMenuConfig, saveMenuConfig, resetMenuConfig } from "@/data/menuConfig";
import { CheckoutConfig, loadCheckoutConfig, saveCheckoutConfig, resetCheckoutConfig } from "@/data/checkoutConfig";
import { Order, loadOrders, saveOrder, updateOrderStatus, deleteOrder } from "@/data/ordersConfig";

// Design config interface
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

const DESIGN_STORAGE_KEY = "shakeyes_design_config";

// Default design config
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

// ===========================================
// CONFIGURATION API
// ===========================================
// Replace these functions with API calls when connecting to external backend

export const ConfigService = {
  // ----- MENU CONFIG -----
  async getMenuConfig(): Promise<MenuConfig> {
    // TODO: Replace with: return fetch('/api/config/menu').then(r => r.json())
    return loadMenuConfig();
  },

  async saveMenuConfig(config: MenuConfig): Promise<void> {
    // TODO: Replace with: return fetch('/api/config/menu', { method: 'PUT', body: JSON.stringify(config) })
    saveMenuConfig(config);
  },

  async resetMenuConfig(): Promise<MenuConfig> {
    // TODO: Replace with: return fetch('/api/config/menu/reset', { method: 'POST' }).then(r => r.json())
    return resetMenuConfig();
  },

  // ----- CHECKOUT CONFIG -----
  async getCheckoutConfig(): Promise<CheckoutConfig> {
    // TODO: Replace with: return fetch('/api/config/checkout').then(r => r.json())
    return loadCheckoutConfig();
  },

  async saveCheckoutConfig(config: CheckoutConfig): Promise<void> {
    // TODO: Replace with: return fetch('/api/config/checkout', { method: 'PUT', body: JSON.stringify(config) })
    saveCheckoutConfig(config);
  },

  async resetCheckoutConfig(): Promise<CheckoutConfig> {
    // TODO: Replace with: return fetch('/api/config/checkout/reset', { method: 'POST' }).then(r => r.json())
    return resetCheckoutConfig();
  },

  // ----- DESIGN CONFIG -----
  async getDesignConfig(): Promise<DesignConfig> {
    // TODO: Replace with: return fetch('/api/config/design').then(r => r.json())
    try {
      const stored = localStorage.getItem(DESIGN_STORAGE_KEY);
      if (stored) {
        return { ...defaultDesignConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading design config:", error);
    }
    return defaultDesignConfig;
  },

  async saveDesignConfig(config: DesignConfig): Promise<void> {
    // TODO: Replace with: return fetch('/api/config/design', { method: 'PUT', body: JSON.stringify(config) })
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving design config:", error);
    }
  },

  async resetDesignConfig(): Promise<DesignConfig> {
    // TODO: Replace with: return fetch('/api/config/design/reset', { method: 'POST' }).then(r => r.json())
    localStorage.removeItem(DESIGN_STORAGE_KEY);
    return defaultDesignConfig;
  },

  // ----- ORDERS -----
  async getOrders(): Promise<Order[]> {
    // TODO: Replace with: return fetch('/api/orders').then(r => r.json())
    return loadOrders();
  },

  async createOrder(order: Order): Promise<void> {
    // TODO: Replace with: return fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })
    saveOrder(order);
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    // TODO: Replace with: return fetch(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    updateOrderStatus(orderId, status);
  },

  async deleteOrder(orderId: string): Promise<void> {
    // TODO: Replace with: return fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    deleteOrder(orderId);
  },

  // ----- IMAGES -----
  // Placeholder for image management - implement when connecting external storage
  async uploadImage(file: File): Promise<string> {
    // TODO: Replace with actual upload to your image service
    // Example: return fetch('/api/images', { method: 'POST', body: formData }).then(r => r.json()).then(d => d.url)
    
    // For now, return a base64 data URL (works locally but not ideal for production)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async deleteImage(imageUrl: string): Promise<void> {
    // TODO: Replace with: return fetch(`/api/images?url=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' })
    console.log("Image deletion not implemented:", imageUrl);
  },

  // ----- EXPORT/IMPORT ALL CONFIG -----
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
      // Note: Orders are typically not imported to avoid duplicates
    } catch (error) {
      console.error("Error importing config:", error);
      throw new Error("Arquivo JSON inválido");
    }
  },
};

// Export types for use in components
export type { MenuConfig, CheckoutConfig, Order };
export { defaultDesignConfig };
