import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckoutConfig, 
  CheckoutStep,
  CheckoutStepOption,
  PricingRule,
  defaultCheckoutSteps 
} from "@/data/checkoutConfig";

interface CheckoutContextType {
  config: CheckoutConfig;
  loading: boolean;
  updateStep: (step: CheckoutStep) => void;
  addStep: (step: CheckoutStep) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (steps: CheckoutStep[]) => void;
  resetToDefault: () => void;
  removeMenuItemFromSteps: (menuItemId: string) => void;
  reloadConfig: () => void;
  syncAllSteps: (steps: CheckoutStep[]) => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<CheckoutConfig>({ steps: defaultCheckoutSteps });
  const [loading, setLoading] = useState(true);

  const loadFromSupabase = useCallback(async () => {
    try {
      // Load checkout steps
      const { data: stepsData } = await supabase
        .from("checkout_steps")
        .select("*")
        .order("sort_order");

      // Load checkout options
      const { data: optionsData } = await supabase
        .from("checkout_step_options")
        .select("*")
        .order("sort_order");

      if (stepsData && stepsData.length > 0) {
        const steps: CheckoutStep[] = stepsData.map(step => {
          const stepOptions = (optionsData || [])
            .filter(opt => opt.step_id === step.id)
            .map(opt => ({
              id: opt.id,
              name: opt.name,
              price: Number(opt.price),
              stock: opt.stock ?? undefined,
              trackStock: opt.track_stock || false,
            }));

          const pricingRule = step.pricing_rule as unknown as PricingRule | undefined;

          return {
            id: step.id,
            type: step.type as CheckoutStep["type"],
            title: step.title,
            subtitle: undefined,
            enabled: step.enabled ?? true,
            required: step.required ?? false,
            multiSelect: (step.max_selections_enabled && (step.max_selections || 1) > 1) || false,
            options: stepOptions,
            showForTable: true,
            showCondition: (step.show_condition || "always") as CheckoutStep["showCondition"],
            triggerItemIds: step.trigger_item_ids || [],
            triggerCategoryIds: step.trigger_category_ids || [],
            pricingRule: pricingRule,
            maxSelectionsEnabled: step.max_selections_enabled || false,
            maxSelections: step.max_selections || 1,
            linkedMenuItems: [],
          };
        });

        // Ensure required built-in steps exist (by type) and keep them at the top
        const deliveryDefault = defaultCheckoutSteps.find(s => s.type === "delivery")!;
        const nameDefault = defaultCheckoutSteps.find(s => s.type === "name")!;

        const byType = new Map<string, CheckoutStep>();
        steps.forEach((s) => {
          if (!byType.has(s.type)) byType.set(s.type, s);
        });

        const ensuredSteps: CheckoutStep[] = [
          byType.get("delivery") ?? { ...deliveryDefault },
          byType.get("name") ?? { ...nameDefault },
          ...steps.filter((s) => s.type !== "delivery" && s.type !== "name"),
        ];

        setConfig({ steps: ensuredSteps });
      } else {
        // No data in Supabase, use defaults
        setConfig({ steps: defaultCheckoutSteps });
      }
    } catch (error) {
      console.error("Error loading checkout config from Supabase:", error);
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

  // Sync all steps to Supabase (used by save button)
  const syncAllSteps = async (steps: CheckoutStep[]) => {
    try {
      // Get existing steps from DB
      const { data: existingSteps } = await supabase
        .from("checkout_steps")
        .select("id");
      
      const existingIds = new Set((existingSteps || []).map(s => s.id));
      const newStepIds = new Set(steps.map(s => s.id));

      // Delete steps that were removed
      const stepsToDelete = [...existingIds].filter(id => !newStepIds.has(id));
      if (stepsToDelete.length > 0) {
        await supabase
          .from("checkout_steps")
          .delete()
          .in("id", stepsToDelete);
      }

      // Upsert all steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Check if step exists
        if (existingIds.has(step.id)) {
          // Update existing step
          await supabase
            .from("checkout_steps")
            .update({
              title: step.title,
              type: step.type,
              enabled: step.enabled,
              required: step.required,
              show_condition: step.showCondition,
              trigger_item_ids: step.triggerItemIds || [],
              trigger_category_ids: step.triggerCategoryIds || [],
              max_selections_enabled: step.maxSelectionsEnabled,
              max_selections: step.maxSelections,
              pricing_rule: step.pricingRule ? JSON.parse(JSON.stringify(step.pricingRule)) : null,
              sort_order: i,
            })
            .eq("id", step.id);
        } else {
          // Insert new step
          await supabase
            .from("checkout_steps")
            .insert({
              id: step.id,
              title: step.title,
              type: step.type,
              enabled: step.enabled,
              required: step.required,
              show_condition: step.showCondition,
              trigger_item_ids: step.triggerItemIds || [],
              trigger_category_ids: step.triggerCategoryIds || [],
              max_selections_enabled: step.maxSelectionsEnabled,
              max_selections: step.maxSelections,
              pricing_rule: step.pricingRule ? JSON.parse(JSON.stringify(step.pricingRule)) : null,
              sort_order: i,
            });
        }

        // Sync options for this step
        // Get existing options
        const { data: existingOptions } = await supabase
          .from("checkout_step_options")
          .select("id")
          .eq("step_id", step.id);
        
        const existingOptionIds = new Set((existingOptions || []).map(o => o.id));
        const newOptionIds = new Set(step.options.map(o => o.id));

        // Delete removed options
        const optionsToDelete = [...existingOptionIds].filter(id => !newOptionIds.has(id));
        if (optionsToDelete.length > 0) {
          await supabase
            .from("checkout_step_options")
            .delete()
            .in("id", optionsToDelete);
        }

        // Upsert options
        for (let j = 0; j < step.options.length; j++) {
          const opt = step.options[j];
          
          if (existingOptionIds.has(opt.id)) {
            // Update
            await supabase
              .from("checkout_step_options")
              .update({
                name: opt.name,
                price: opt.price,
                stock: opt.stock ?? null,
                track_stock: opt.trackStock || false,
                sort_order: j,
              })
              .eq("id", opt.id);
          } else {
            // Insert
            await supabase
              .from("checkout_step_options")
              .insert({
                id: opt.id,
                step_id: step.id,
                name: opt.name,
                price: opt.price,
                stock: opt.stock ?? null,
                track_stock: opt.trackStock || false,
                sort_order: j,
              });
          }
        }
      }

      setConfig({ steps });
    } catch (error) {
      console.error("Error syncing checkout steps:", error);
      throw error;
    }
  };

  const updateStep = async (step: CheckoutStep) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => (s.id === step.id ? step : s)),
    }));

    // Update step in Supabase
    await supabase
      .from("checkout_steps")
      .update({
        title: step.title,
        type: step.type,
        enabled: step.enabled,
        required: step.required,
        show_condition: step.showCondition,
        trigger_item_ids: step.triggerItemIds || [],
        trigger_category_ids: step.triggerCategoryIds || [],
        max_selections_enabled: step.maxSelectionsEnabled,
        max_selections: step.maxSelections,
        pricing_rule: step.pricingRule ? JSON.parse(JSON.stringify(step.pricingRule)) : null,
      })
      .eq("id", step.id);

    // Sync options
    const { data: existingOptions } = await supabase
      .from("checkout_step_options")
      .select("id")
      .eq("step_id", step.id);
    
    const existingOptionIds = new Set((existingOptions || []).map(o => o.id));
    const newOptionIds = new Set(step.options.map(o => o.id));

    // Delete removed options
    const optionsToDelete = [...existingOptionIds].filter(id => !newOptionIds.has(id));
    if (optionsToDelete.length > 0) {
      await supabase
        .from("checkout_step_options")
        .delete()
        .in("id", optionsToDelete);
    }

    // Upsert options
    for (let j = 0; j < step.options.length; j++) {
      const opt = step.options[j];
      
      if (existingOptionIds.has(opt.id)) {
        await supabase
          .from("checkout_step_options")
          .update({
            name: opt.name,
            price: opt.price,
            stock: opt.stock ?? null,
            track_stock: opt.trackStock || false,
            sort_order: j,
          })
          .eq("id", opt.id);
      } else {
        await supabase
          .from("checkout_step_options")
          .insert({
            id: opt.id,
            step_id: step.id,
            name: opt.name,
            price: opt.price,
            stock: opt.stock ?? null,
            track_stock: opt.trackStock || false,
            sort_order: j,
          });
      }
    }
  };

  const addStep = async (step: CheckoutStep) => {
    const { data, error } = await supabase
      .from("checkout_steps")
      .insert([{
        id: step.id,
        title: step.title,
        type: step.type,
        enabled: step.enabled,
        required: step.required,
        show_condition: step.showCondition,
        trigger_item_ids: step.triggerItemIds || [],
        trigger_category_ids: step.triggerCategoryIds || [],
        max_selections_enabled: step.maxSelectionsEnabled,
        max_selections: step.maxSelections,
        pricing_rule: step.pricingRule ? JSON.parse(JSON.stringify(step.pricingRule)) : null,
        sort_order: config.steps.length,
      }])
      .select()
      .single();

    if (!error && data) {
      // Insert options
      if (step.options.length > 0) {
        await supabase
          .from("checkout_step_options")
          .insert(
            step.options.map((opt, idx) => ({
              id: opt.id,
              step_id: data.id,
              name: opt.name,
              price: opt.price,
              stock: opt.stock ?? null,
              track_stock: opt.trackStock || false,
              sort_order: idx,
            }))
          );
      }

      setConfig(prev => ({
        ...prev,
        steps: [...prev.steps, step],
      }));
    }
  };

  const deleteStep = async (id: string) => {
    const step = config.steps.find((s) => s.id === id);
    if (step?.type === "delivery" || step?.type === "name") {
      return;
    }

    // Options will be cascade deleted
    const { error } = await supabase
      .from("checkout_steps")
      .delete()
      .eq("id", id);

    if (!error) {
      setConfig(prev => ({
        ...prev,
        steps: prev.steps.filter(s => s.id !== id),
      }));
    }
  };

  const reorderSteps = async (steps: CheckoutStep[]) => {
    // This now calls syncAllSteps to properly handle all changes
    await syncAllSteps(steps);
  };

  const resetToDefault = async () => {
    // Delete all checkout steps and options
    await supabase.from("checkout_step_options").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("checkout_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    setConfig({ steps: defaultCheckoutSteps });
  };

  const removeMenuItemFromSteps = useCallback((menuItemId: string) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(step => ({
        ...step,
        triggerItemIds: (step.triggerItemIds || []).filter(id => id !== menuItemId),
        linkedMenuItems: (step.linkedMenuItems || []).filter(l => l.itemId !== menuItemId),
      })),
    }));
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        config,
        loading,
        updateStep,
        addStep,
        deleteStep,
        reorderSteps,
        resetToDefault,
        removeMenuItemFromSteps,
        reloadConfig,
        syncAllSteps,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
