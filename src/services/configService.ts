/**
 * Configuration Service
 * 
 * This service manages all JSON configuration data.
 * Uses Supabase for persistence.
 */

import { supabase } from "@/integrations/supabase/client";
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

export const ConfigService = {
  // ----- MENU CONFIG -----
  async getMenuConfig(): Promise<MenuConfig> {
    return loadMenuConfig();
  },

  async saveMenuConfig(config: MenuConfig): Promise<void> {
    saveMenuConfig(config);
  },

  async resetMenuConfig(): Promise<MenuConfig> {
    return resetMenuConfig();
  },

  // ----- CHECKOUT CONFIG -----
  async getCheckoutConfig(): Promise<CheckoutConfig> {
    return loadCheckoutConfig();
  },

  async saveCheckoutConfig(config: CheckoutConfig): Promise<void> {
    saveCheckoutConfig(config);
  },

  async resetCheckoutConfig(): Promise<CheckoutConfig> {
    return resetCheckoutConfig();
  },

  // ----- DESIGN CONFIG -----
  async getDesignConfig(): Promise<DesignConfig> {
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
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving design config:", error);
    }
  },

  async resetDesignConfig(): Promise<DesignConfig> {
    localStorage.removeItem(DESIGN_STORAGE_KEY);
    return defaultDesignConfig;
  },

  // ----- ORDERS -----
  async getOrders(): Promise<Order[]> {
    return loadOrders();
  },

  async createOrder(order: Order): Promise<void> {
    saveOrder(order);
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    updateOrderStatus(orderId, status);
  },

  async deleteOrder(orderId: string): Promise<void> {
    deleteOrder(orderId);
  },

  // ----- IMAGES -----
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

  // ----- EXPORT/IMPORT ALL CONFIG (FROM SUPABASE) -----
  async exportAllConfig(): Promise<string> {
    try {
      // Export from Supabase
      const [categoriesRes, itemsRes, stepsRes, optionsRes, designRes, ordersRes] = await Promise.all([
        supabase.from("menu_categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("sort_order"),
        supabase.from("checkout_steps").select("*").order("sort_order"),
        supabase.from("checkout_step_options").select("*").order("sort_order"),
        supabase.from("design_config").select("*").limit(1).single(),
        supabase.from("orders").select("*").order("created_at", { ascending: false })
      ]);

      const fullConfig = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        categories: categoriesRes.data || [],
        menuItems: itemsRes.data || [],
        checkoutSteps: stepsRes.data || [],
        checkoutOptions: optionsRes.data || [],
        design: designRes.data || null,
        orders: ordersRes.data || [],
      };

      return JSON.stringify(fullConfig, null, 2);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },

  async importAllConfig(jsonString: string): Promise<void> {
    try {
      const config = JSON.parse(jsonString);
      
      // Check version for Supabase format
      if (config.version === "2.0") {
        // Import categories
        if (config.categories && config.categories.length > 0) {
          // Delete existing categories first
          await supabase.from("menu_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          
          for (const cat of config.categories) {
            await supabase.from("menu_categories").insert({
              id: cat.id,
              name: cat.name,
              color: cat.color,
              sort_order: cat.sort_order
            });
          }
        }

        // Import menu items
        if (config.menuItems && config.menuItems.length > 0) {
          // Delete existing items first
          await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          
          for (const item of config.menuItems) {
            await supabase.from("menu_items").insert({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              prices_json: item.prices_json,
              category_id: item.category_id,
              image_url: item.image_url,
              stock: item.stock,
              sort_order: item.sort_order
            });
          }
        }

        // Import checkout steps
        if (config.checkoutSteps && config.checkoutSteps.length > 0) {
          // Delete existing steps and options first
          await supabase.from("checkout_step_options").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          await supabase.from("checkout_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          
          for (const step of config.checkoutSteps) {
            await supabase.from("checkout_steps").insert({
              id: step.id,
              title: step.title,
              type: step.type,
              enabled: step.enabled,
              required: step.required,
              show_condition: step.show_condition,
              trigger_item_ids: step.trigger_item_ids,
              trigger_category_ids: step.trigger_category_ids,
              max_selections: step.max_selections,
              max_selections_enabled: step.max_selections_enabled,
              pricing_rule: step.pricing_rule,
              sort_order: step.sort_order
            });
          }
        }

        // Import checkout options
        if (config.checkoutOptions && config.checkoutOptions.length > 0) {
          for (const opt of config.checkoutOptions) {
            await supabase.from("checkout_step_options").insert({
              id: opt.id,
              step_id: opt.step_id,
              name: opt.name,
              price: opt.price,
              stock: opt.stock,
              track_stock: opt.track_stock,
              is_linked_menu_item: opt.is_linked_menu_item,
              linked_menu_item_id: opt.linked_menu_item_id,
              exclude_from_stock: opt.exclude_from_stock,
              sort_order: opt.sort_order
            });
          }
        }

        // Import design config
        if (config.design) {
          const existing = await supabase.from("design_config").select("id").limit(1).single();
          if (existing.data) {
            await supabase.from("design_config").update({
              store_name: config.design.store_name,
              store_description: config.design.store_description,
              logo_url: config.design.logo_url,
              social_links: config.design.social_links,
              primary_color: config.design.primary_color,
              background_color: config.design.background_color,
              card_background: config.design.card_background,
              accent_color: config.design.accent_color,
              border_color: config.design.border_color,
              text_color: config.design.text_color,
              heading_color: config.design.heading_color,
              muted_color: config.design.muted_color,
              display_font: config.design.display_font,
              body_font: config.design.body_font,
              price_font: config.design.price_font,
              button_font: config.design.button_font,
              nav_font: config.design.nav_font,
              custom_font_name: config.design.custom_font_name,
              custom_font_url: config.design.custom_font_url
            }).eq("id", existing.data.id);
          }
        }
      } else {
        // Legacy format - try to import the old way
        if (config.menu) {
          await this.saveMenuConfig(config.menu);
        }
        if (config.checkout) {
          await this.saveCheckoutConfig(config.checkout);
        }
        if (config.design) {
          await this.saveDesignConfig(config.design);
        }
      }
    } catch (error) {
      console.error("Error importing config:", error);
      throw new Error("Arquivo JSON inválido ou erro ao importar");
    }
  },
};

// Export types for use in components
export type { MenuConfig, CheckoutConfig, Order };
export { defaultDesignConfig };
