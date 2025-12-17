import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number | null;
  sort_order: number;
  category?: string;
}

export const useSupabaseMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .order("sort_order");
    
    if (!error && data) {
      setCategories(data);
    }
    return data || [];
  }, []);

  const fetchMenuItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order");
    
    if (!error && data) {
      setMenuItems(data.map(item => ({
        ...item,
        price: Number(item.price),
      })));
    }
    return data || [];
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchMenuItems()]);
    setLoading(false);
  }, [fetchCategories, fetchMenuItems]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Categories CRUD
  const addCategory = async (category: Omit<Category, "id">) => {
    const { data, error } = await supabase
      .from("menu_categories")
      .insert(category)
      .select()
      .single();
    
    if (!error && data) {
      setCategories(prev => [...prev, data]);
    }
    return { data, error };
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from("menu_categories")
      .update(updates)
      .eq("id", id);
    
    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
    return { error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);
    
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      // Items with this category will be cascade deleted
      setMenuItems(prev => prev.filter(i => i.category_id !== id));
    }
    return { error };
  };

  // Menu Items CRUD
  const addMenuItem = async (item: Omit<MenuItem, "id" | "sort_order">) => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        ...item,
        sort_order: menuItems.length,
      })
      .select()
      .single();
    
    if (!error && data) {
      setMenuItems(prev => [...prev, { ...data, price: Number(data.price) }]);
    }
    return { data, error };
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const { error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id);
    
    if (!error) {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
    return { error };
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);
    
    if (!error) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
    }
    return { error };
  };

  const updateStock = async (id: string, stock: number | null) => {
    return updateMenuItem(id, { stock });
  };

  return {
    categories,
    menuItems,
    loading,
    reload,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateStock,
  };
};
