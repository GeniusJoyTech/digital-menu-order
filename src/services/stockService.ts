import { loadMenuConfig, saveMenuConfig } from "@/data/menuConfig";
import { loadCheckoutConfig, saveCheckoutConfig } from "@/data/checkoutConfig";
import { Order } from "@/data/ordersConfig";

interface StockItem {
  id: string;
  quantity: number;
  source: "menu" | "extras" | "drinks" | "checkoutStep";
  stepId?: string;
}

// Decrease stock when order is placed
export const decreaseStock = (order: Order): void => {
  const menuConfig = loadMenuConfig();
  const checkoutConfig = loadCheckoutConfig();
  let menuChanged = false;
  let checkoutChanged = false;

  // Decrease menu items stock
  order.items.forEach(item => {
    // Find menu item by name
    const menuItem = menuConfig.menuItems.find(m => m.name === item.name);
    if (menuItem && menuItem.stock !== undefined && menuItem.stock > 0) {
      menuItem.stock = Math.max(0, menuItem.stock - item.quantity);
      menuChanged = true;
    }
  });

  // Decrease extras stock
  order.extras.forEach(extra => {
    // Check in menuConfig.extras
    const extraItem = menuConfig.extras.find(e => e.name === extra.name);
    if (extraItem && extraItem.stock !== undefined && extraItem.stock > 0) {
      extraItem.stock = Math.max(0, extraItem.stock - 1);
      menuChanged = true;
    }

    // Check in checkout step options
    checkoutConfig.steps.forEach(step => {
      if (step.options) {
        const option = step.options.find(o => o.name === extra.name && o.trackStock);
        if (option && option.stock !== undefined && option.stock > 0) {
          option.stock = Math.max(0, option.stock - 1);
          checkoutChanged = true;
        }
      }
    });
  });

  // Decrease drink stock
  if (order.drink) {
    const drinkItem = menuConfig.drinkOptions.find(d => d.name === order.drink!.name);
    if (drinkItem && drinkItem.stock !== undefined && drinkItem.stock > 0) {
      drinkItem.stock = Math.max(0, drinkItem.stock - 1);
      menuChanged = true;
    }
  }

  if (menuChanged) {
    saveMenuConfig(menuConfig);
  }
  if (checkoutChanged) {
    saveCheckoutConfig(checkoutConfig);
  }
};

// Restore stock when order is cancelled
export const restoreStock = (order: Order): void => {
  const menuConfig = loadMenuConfig();
  const checkoutConfig = loadCheckoutConfig();
  let menuChanged = false;
  let checkoutChanged = false;

  // Restore menu items stock
  order.items.forEach(item => {
    const menuItem = menuConfig.menuItems.find(m => m.name === item.name);
    if (menuItem && menuItem.stock !== undefined) {
      menuItem.stock += item.quantity;
      menuChanged = true;
    }
  });

  // Restore extras stock
  order.extras.forEach(extra => {
    // Check in menuConfig.extras
    const extraItem = menuConfig.extras.find(e => e.name === extra.name);
    if (extraItem && extraItem.stock !== undefined) {
      extraItem.stock += 1;
      menuChanged = true;
    }

    // Check in checkout step options
    checkoutConfig.steps.forEach(step => {
      if (step.options) {
        const option = step.options.find(o => o.name === extra.name && o.trackStock);
        if (option && option.stock !== undefined) {
          option.stock += 1;
          checkoutChanged = true;
        }
      }
    });
  });

  // Restore drink stock
  if (order.drink) {
    const drinkItem = menuConfig.drinkOptions.find(d => d.name === order.drink!.name);
    if (drinkItem && drinkItem.stock !== undefined) {
      drinkItem.stock += 1;
      menuChanged = true;
    }
  }

  if (menuChanged) {
    saveMenuConfig(menuConfig);
  }
  if (checkoutChanged) {
    saveCheckoutConfig(checkoutConfig);
  }
};

// Get available stock for a menu item
export const getItemStock = (itemName: string): number | undefined => {
  const menuConfig = loadMenuConfig();
  const item = menuConfig.menuItems.find(m => m.name === itemName);
  return item?.stock;
};
