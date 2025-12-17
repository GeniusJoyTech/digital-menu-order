import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface OrderExtra {
  name: string;
  price: number;
  quantity?: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string | null;
  delivery_type: string | null;
  items: OrderItem[];
  extras: OrderExtra[];
  drink: string | null;
  observations: string | null;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export const useSupabaseOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (date?: Date) => {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setOrders(data.map(order => ({
        ...order,
        items: (order.items as unknown as OrderItem[]) || [],
        extras: (order.extras as unknown as OrderExtra[]) || [],
        total: Number(order.total),
      })));
    }
    setLoading(false);
    return data || [];
  }, []);

  const reload = useCallback(async (date?: Date) => {
    setLoading(true);
    await fetchOrders(date);
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (order: Omit<Order, "id" | "created_at">) => {
    const insertData = {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      table_number: order.table_number,
      delivery_type: order.delivery_type,
      items: order.items as any,
      extras: order.extras as any,
      drink: order.drink,
      observations: order.observations,
      total: order.total,
      status: order.status,
    };
    const { data, error } = await supabase
      .from("orders")
      .insert(insertData)
      .select()
      .single();
    
    if (!error && data) {
      const newOrder = {
        ...data,
        items: (data.items as unknown as OrderItem[]) || [],
        extras: (data.extras as unknown as OrderExtra[]) || [],
        total: Number(data.total),
      };
      setOrders(prev => [newOrder, ...prev]);
    }
    return { data, error };
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
    return { error };
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);
    
    if (!error) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
    return { error };
  };

  const deleteOldOrders = async (daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error, count } = await supabase
      .from("orders")
      .delete()
      .lt("created_at", cutoffDate.toISOString());
    
    if (!error) {
      setOrders(prev => prev.filter(o => new Date(o.created_at) >= cutoffDate));
    }
    return { error, count };
  };

  return {
    orders,
    loading,
    reload,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    deleteOldOrders,
  };
};
