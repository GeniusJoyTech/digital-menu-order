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

      if (stepsData) {
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

        // Ensure default steps exist
        const ids = new Set(steps.map(s => s.id));
        const ensuredSteps = [...steps];
        
        for (const defaultStep of defaultCheckoutSteps) {
          if ((defaultStep.id === "delivery" || defaultStep.id === "name") && !ids.has(defaultStep.id)) {
            ensuredSteps.unshift({ ...defaultStep });
          }
        }

        setConfig({ steps: ensuredSteps });
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

    // Update options - delete existing and re-insert
    await supabase
      .from("checkout_step_options")
      .delete()
      .eq("step_id", step.id);

    if (step.options.length > 0) {
      await supabase
        .from("checkout_step_options")
        .insert(
          step.options.map((opt, idx) => ({
            id: opt.id,
            step_id: step.id,
            name: opt.name,
            price: opt.price,
            stock: opt.stock ?? null,
            track_stock: opt.trackStock || false,
            sort_order: idx,
          }))
        );
    }
  };

  const addStep = async (step: CheckoutStep) => {
    const { data, error } = await supabase
      .from("checkout_steps")
      .insert([{
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
      const newStep = { ...step, id: data.id };
      
      // Insert options
      if (step.options.length > 0) {
        await supabase
          .from("checkout_step_options")
          .insert(
            step.options.map((opt, idx) => ({
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
        steps: [...prev.steps, newStep],
      }));
    }
  };

  const deleteStep = async (id: string) => {
    if (id === "delivery" || id === "name") {
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
    setConfig(prev => ({ ...prev, steps }));

    // Update sort_order for all steps
    for (let i = 0; i < steps.length; i++) {
      await supabase
        .from("checkout_steps")
        .update({ sort_order: i })
        .eq("id", steps[i].id);
    }
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
