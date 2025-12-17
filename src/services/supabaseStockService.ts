import { supabase } from "@/integrations/supabase/client";

export interface OrderItemForStock {
  id?: string;
  name: string;
  quantity: number;
}

export interface OrderExtraForStock {
  id?: string;
  name: string;
  quantity?: number;
}

export interface OrderForStock {
  items: OrderItemForStock[];
  extras: OrderExtraForStock[];
}

// Decrease stock for menu items when order is placed
export const decreaseMenuItemStock = async (itemId: string, quantity: number): Promise<void> => {
  // First get current stock
  const { data: item } = await supabase
    .from("menu_items")
    .select("stock")
    .eq("id", itemId)
    .maybeSingle();
  
  if (item && item.stock !== null && item.stock > 0) {
    const newStock = Math.max(0, item.stock - quantity);
    await supabase
      .from("menu_items")
      .update({ stock: newStock })
      .eq("id", itemId);
  }
};

// Decrease stock for checkout step options when order is placed
export const decreaseOptionStock = async (optionId: string, quantity: number = 1): Promise<void> => {
  // First get current stock
  const { data: option } = await supabase
    .from("checkout_step_options")
    .select("stock, track_stock")
    .eq("id", optionId)
    .maybeSingle();
  
  if (option && option.track_stock && option.stock !== null && option.stock > 0) {
    const newStock = Math.max(0, option.stock - quantity);
    await supabase
      .from("checkout_step_options")
      .update({ stock: newStock })
      .eq("id", optionId);
  }
};

// Restore stock for menu items when order is cancelled
export const restoreMenuItemStock = async (itemId: string, quantity: number): Promise<void> => {
  const { data: item } = await supabase
    .from("menu_items")
    .select("stock")
    .eq("id", itemId)
    .maybeSingle();
  
  if (item && item.stock !== null) {
    const newStock = item.stock + quantity;
    await supabase
      .from("menu_items")
      .update({ stock: newStock })
      .eq("id", itemId);
  }
};

// Restore stock for checkout step options when order is cancelled
export const restoreOptionStock = async (optionId: string, quantity: number = 1): Promise<void> => {
  const { data: option } = await supabase
    .from("checkout_step_options")
    .select("stock, track_stock")
    .eq("id", optionId)
    .maybeSingle();
  
  if (option && option.track_stock && option.stock !== null) {
    const newStock = option.stock + quantity;
    await supabase
      .from("checkout_step_options")
      .update({ stock: newStock })
      .eq("id", optionId);
  }
};

// Decrease stock for entire order (items + extras)
export const decreaseOrderStock = async (
  items: { id: string; quantity: number }[],
  extras: { id: string; quantity?: number }[]
): Promise<void> => {
  // Decrease menu items stock
  for (const item of items) {
    if (item.id) {
      await decreaseMenuItemStock(item.id, item.quantity);
    }
  }
  
  // Decrease extras/options stock
  for (const extra of extras) {
    if (extra.id) {
      await decreaseOptionStock(extra.id, extra.quantity || 1);
    }
  }
};

// Restore stock for entire order when cancelled
export const restoreOrderStock = async (
  items: { id: string; quantity: number }[],
  extras: { id: string; quantity?: number }[]
): Promise<void> => {
  // Restore menu items stock
  for (const item of items) {
    if (item.id) {
      await restoreMenuItemStock(item.id, item.quantity);
    }
  }
  
  // Restore extras/options stock
  for (const extra of extras) {
    if (extra.id) {
      await restoreOptionStock(extra.id, extra.quantity || 1);
    }
  }
};
