import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/data/menuData";

export interface MenuConfig {
  menuItems: MenuItem[];
  extras: { id: string; name: string; price: number; stock?: number }[];
  categories: { id: string; name: string; color: string }[];
  drinkOptions: { id: string; name: string; price: number; stock?: number }[];
  acaiTurbine: { name: string; stock?: number }[];
}

interface MenuContextType {
  config: MenuConfig;
  loading: boolean;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  updateExtra: (extra: { id: string; name: string; price: number; stock?: number }) => void;
  addExtra: (extra: { id: string; name: string; price: number; stock?: number }) => void;
  deleteExtra: (id: string) => void;
  updateDrinkOption: (drink: { id: string; name: string; price: number; stock?: number }) => void;
  addDrinkOption: (drink: { id: string; name: string; price: number; stock?: number }) => void;
  deleteDrinkOption: (id: string) => void;
  updateAcaiTurbine: (items: { name: string; stock?: number }[]) => void;
  addAcaiTurbineItem: (item: { name: string; stock?: number }) => void;
  removeAcaiTurbineItem: (index: number) => void;
  updateAcaiTurbineItem: (index: number, item: { name: string; stock?: number }) => void;
  updateCategories: (categories: { id: string; name: string; color: string }[]) => void;
  resetToDefault: () => void;
  reloadConfig: () => void;
}

const defaultConfig: MenuConfig = {
  menuItems: [],
  extras: [],
  categories: [],
  drinkOptions: [],
  acaiTurbine: [],
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<MenuConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const loadFromSupabase = useCallback(async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("*")
        .order("sort_order");

      // Load menu items
      const { data: itemsData } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order");

      const categories = (categoriesData || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color || "#ec4899",
      }));

      const menuItems: MenuItem[] = (itemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        prices: [{ size: "Único", price: Number(item.price) }],
        category: item.category_id || "",
        image: item.image_url || "/placeholder.svg",
        stock: item.stock ?? undefined,
      }));

      setConfig(prev => ({
        ...prev,
        categories,
        menuItems,
      }));
    } catch (error) {
      console.error("Error loading menu from Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const reloadConfig = () => {
    setLoading(true);
    loadFromSupabase();
  };

  const updateMenuItem = async (item: MenuItem) => {
    setConfig(prev => ({
      ...prev,
      menuItems: prev.menuItems.map(i => (i.id === item.id ? item : i)),
    }));

    await supabase
      .from("menu_items")
      .update({
        name: item.name,
        description: item.description,
        price: item.prices[0]?.price || 0,
        category_id: item.category || null,
        image_url: item.image,
        stock: item.stock ?? null,
      })
      .eq("id", item.id);
  };

  const addMenuItem = async (item: MenuItem) => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.prices[0]?.price || 0,
        category_id: item.category || null,
        image_url: item.image,
        stock: item.stock ?? null,
        sort_order: config.menuItems.length,
      })
      .select()
      .single();

    if (!error && data) {
      setConfig(prev => ({
        ...prev,
        menuItems: [...prev.menuItems, item],
      }));
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setConfig(prev => ({
        ...prev,
        menuItems: prev.menuItems.filter(i => i.id !== id),
      }));
    }
  };

  // Extras, drinks, and acai turbine are kept in local state
  // These can be migrated to checkout_step_options later
  const updateExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      extras: prev.extras.map(e => (e.id === extra.id ? extra : e)),
    }));
  };

  const addExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      extras: [...prev.extras, extra],
    }));
  };

  const deleteExtra = (id: string) => {
    setConfig(prev => ({
      ...prev,
      extras: prev.extras.filter(e => e.id !== id),
    }));
  };

  const updateDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      drinkOptions: prev.drinkOptions.map(d => (d.id === drink.id ? drink : d)),
    }));
  };

  const addDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      drinkOptions: [...prev.drinkOptions, drink],
    }));
  };

  const deleteDrinkOption = (id: string) => {
    setConfig(prev => ({
      ...prev,
      drinkOptions: prev.drinkOptions.filter(d => d.id !== id),
    }));
  };

  const updateAcaiTurbine = (items: { name: string; stock?: number }[]) => {
    setConfig(prev => ({
      ...prev,
      acaiTurbine: items,
    }));
  };

  const addAcaiTurbineItem = (item: { name: string; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      acaiTurbine: [...prev.acaiTurbine, item],
    }));
  };

  const removeAcaiTurbineItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      acaiTurbine: prev.acaiTurbine.filter((_, i) => i !== index),
    }));
  };

  const updateAcaiTurbineItem = (index: number, item: { name: string; stock?: number }) => {
    setConfig(prev => ({
      ...prev,
      acaiTurbine: prev.acaiTurbine.map((i, idx) => (idx === index ? item : i)),
    }));
  };

  const updateCategories = async (categories: { id: string; name: string; color: string }[]) => {
    setConfig(prev => ({ ...prev, categories }));

    // Sync with Supabase - this is a simplified version
    // For full sync, we'd need to track additions/updates/deletions
    for (const cat of categories) {
      const existing = config.categories.find(c => c.id === cat.id);
      if (existing) {
        await supabase
          .from("menu_categories")
          .update({ name: cat.name, color: cat.color })
          .eq("id", cat.id);
      } else {
        await supabase
          .from("menu_categories")
          .insert({ id: cat.id, name: cat.name, color: cat.color, sort_order: categories.indexOf(cat) });
      }
    }

    // Remove categories that were deleted
    const currentIds = categories.map(c => c.id);
    const deletedCategories = config.categories.filter(c => !currentIds.includes(c.id));
    for (const cat of deletedCategories) {
      await supabase.from("menu_categories").delete().eq("id", cat.id);
    }
  };

  const resetToDefault = async () => {
    // Delete all menu items and categories
    await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("menu_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setConfig(defaultConfig);
  };

  return (
    <MenuContext.Provider
      value={{
        config,
        loading,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        updateExtra,
        addExtra,
        deleteExtra,
        updateDrinkOption,
        addDrinkOption,
        deleteDrinkOption,
        updateAcaiTurbine,
        addAcaiTurbineItem,
        removeAcaiTurbineItem,
        updateAcaiTurbineItem,
        updateCategories,
        resetToDefault,
        reloadConfig,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
