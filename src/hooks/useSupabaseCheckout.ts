import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PricingRule {
  type: "per_item" | "flat_after_limit" | "per_item_after_limit";
  freeLimit?: number;
  pricePerItem?: number;
  flatPrice?: number;
}

export interface CheckoutStepOption {
  id: string;
  step_id: string;
  name: string;
  price: number;
  is_linked_menu_item: boolean;
  linked_menu_item_id: string | null;
  exclude_from_stock: boolean;
  track_stock: boolean;
  stock: number | null;
  sort_order: number;
}

export interface CheckoutStep {
  id: string;
  type: string;
  title: string;
  required: boolean;
  enabled: boolean;
  show_condition: string;
  trigger_item_ids: string[];
  trigger_category_ids: string[];
  max_selections_enabled: boolean;
  max_selections: number;
  pricing_rule: PricingRule | null;
  sort_order: number;
  options?: CheckoutStepOption[];
}

export const useSupabaseCheckout = () => {
  const [steps, setSteps] = useState<CheckoutStep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSteps = useCallback(async () => {
    // Fetch steps
    const { data: stepsData, error: stepsError } = await supabase
      .from("checkout_steps")
      .select("*")
      .order("sort_order");
    
    if (stepsError) {
      console.error("Error fetching steps:", stepsError);
      setLoading(false);
      return;
    }

    // Fetch all options
    const { data: optionsData, error: optionsError } = await supabase
      .from("checkout_step_options")
      .select("*")
      .order("sort_order");
    
    if (optionsError) {
      console.error("Error fetching options:", optionsError);
    }

    // Merge options into steps
    const stepsWithOptions = (stepsData || []).map(step => ({
      ...step,
      pricing_rule: step.pricing_rule as unknown as PricingRule | null,
      options: (optionsData || [])
        .filter(opt => opt.step_id === step.id)
        .map(opt => ({ ...opt, price: Number(opt.price) })),
    }));

    setSteps(stepsWithOptions);
    setLoading(false);
    return stepsWithOptions;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchSteps();
  }, [fetchSteps]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Steps CRUD
  const addStep = async (step: Omit<CheckoutStep, "id" | "sort_order" | "options">) => {
    const { pricing_rule, ...rest } = step;
    const insertData = {
      ...rest,
      pricing_rule: pricing_rule as any,
      sort_order: steps.length,
    };
    const { data, error } = await supabase
      .from("checkout_steps")
      .insert(insertData)
      .select()
      .single();
    
    if (!error && data) {
      setSteps(prev => [...prev, { ...data, pricing_rule: data.pricing_rule as unknown as PricingRule | null, options: [] }]);
    }
    return { data, error };
  };

  const updateStep = async (id: string, updates: Partial<CheckoutStep>) => {
    const { options, pricing_rule, ...stepUpdates } = updates;
    
    const updateData = {
      ...stepUpdates,
      ...(pricing_rule !== undefined && { pricing_rule: pricing_rule as any }),
    };
    const { error } = await supabase
      .from("checkout_steps")
      .update(updateData)
      .eq("id", id);
    
    if (!error) {
      setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
    return { error };
  };

  const deleteStep = async (id: string) => {
    // Don't allow deleting built-in steps
    const step = steps.find(s => s.id === id);
    if (step?.type === "delivery" || step?.type === "name") {
      return { error: { message: "Cannot delete built-in steps" } };
    }

    const { error } = await supabase
      .from("checkout_steps")
      .delete()
      .eq("id", id);
    
    if (!error) {
      setSteps(prev => prev.filter(s => s.id !== id));
    }
    return { error };
  };

  const reorderSteps = async (newSteps: CheckoutStep[]) => {
    // Update sort_order for each step
    const updates = newSteps.map((step, index) => 
      supabase
        .from("checkout_steps")
        .update({ sort_order: index })
        .eq("id", step.id)
    );
    
    await Promise.all(updates);
    setSteps(newSteps.map((s, i) => ({ ...s, sort_order: i })));
  };

  // Options CRUD
  const addOption = async (stepId: string, option: Omit<CheckoutStepOption, "id" | "step_id" | "sort_order">) => {
    const step = steps.find(s => s.id === stepId);
    const sortOrder = step?.options?.length || 0;

    const { data, error } = await supabase
      .from("checkout_step_options")
      .insert({
        ...option,
        step_id: stepId,
        sort_order: sortOrder,
      })
      .select()
      .single();
    
    if (!error && data) {
      setSteps(prev => prev.map(s => 
        s.id === stepId 
          ? { ...s, options: [...(s.options || []), { ...data, price: Number(data.price) }] }
          : s
      ));
    }
    return { data, error };
  };

  const updateOption = async (optionId: string, updates: Partial<CheckoutStepOption>) => {
    const { error } = await supabase
      .from("checkout_step_options")
      .update(updates)
      .eq("id", optionId);
    
    if (!error) {
      setSteps(prev => prev.map(s => ({
        ...s,
        options: s.options?.map(o => o.id === optionId ? { ...o, ...updates } : o),
      })));
    }
    return { error };
  };

  const deleteOption = async (optionId: string) => {
    const { error } = await supabase
      .from("checkout_step_options")
      .delete()
      .eq("id", optionId);
    
    if (!error) {
      setSteps(prev => prev.map(s => ({
        ...s,
        options: s.options?.filter(o => o.id !== optionId),
      })));
    }
    return { error };
  };

  // Remove menu item references from steps
  const removeMenuItemFromSteps = async (menuItemId: string) => {
    // Update trigger_item_ids
    for (const step of steps) {
      if (step.trigger_item_ids?.includes(menuItemId)) {
        await updateStep(step.id, {
          trigger_item_ids: step.trigger_item_ids.filter(id => id !== menuItemId),
        });
      }
    }

    // Delete linked options
    const { error } = await supabase
      .from("checkout_step_options")
      .delete()
      .eq("linked_menu_item_id", menuItemId);
    
    if (!error) {
      setSteps(prev => prev.map(s => ({
        ...s,
        options: s.options?.filter(o => o.linked_menu_item_id !== menuItemId),
      })));
    }
  };

  return {
    steps,
    loading,
    reload,
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    addOption,
    updateOption,
    deleteOption,
    removeMenuItemFromSteps,
  };
};
