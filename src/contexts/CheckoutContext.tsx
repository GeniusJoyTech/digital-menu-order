import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  CheckoutConfig, 
  CheckoutStep, 
  loadCheckoutConfig, 
  saveCheckoutConfig, 
  resetCheckoutConfig,
  defaultCheckoutSteps 
} from "@/data/checkoutConfig";

interface CheckoutContextType {
  config: CheckoutConfig;
  updateStep: (step: CheckoutStep) => void;
  addStep: (step: CheckoutStep) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (steps: CheckoutStep[]) => void;
  resetToDefault: () => void;
  // Sync functions to remove references when menu items are deleted
  removeMenuItemFromSteps: (menuItemId: string) => void;
  reloadConfig: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<CheckoutConfig>(loadCheckoutConfig);

  useEffect(() => {
    saveCheckoutConfig(config);
  }, [config]);

  const reloadConfig = () => {
    setConfig(loadCheckoutConfig());
  };

  const updateStep = (step: CheckoutStep) => {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === step.id ? step : s)),
    }));
  };

  const addStep = (step: CheckoutStep) => {
    setConfig((prev) => ({
      ...prev,
      steps: [...prev.steps, step],
    }));
  };

  const deleteStep = (id: string) => {
    // Prevent deleting required built-in steps
    if (id === "delivery" || id === "name") {
      return;
    }
    // When deleting a step, exclusive items (options with trackStock) are automatically removed
    // since they only exist within the step
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== id),
    }));
  };

  const reorderSteps = (steps: CheckoutStep[]) => {
    setConfig((prev) => ({
      ...prev,
      steps,
    }));
  };

  const resetToDefault = () => {
    const defaultConfig = resetCheckoutConfig();
    setConfig(defaultConfig);
  };

  // Remove a menu item from all step references (linkedMenuItems, triggerItemIds)
  const removeMenuItemFromSteps = useCallback((menuItemId: string) => {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => ({
        ...step,
        triggerItemIds: (step.triggerItemIds || []).filter((id) => id !== menuItemId),
        linkedMenuItems: (step.linkedMenuItems || []).filter((l) => l.itemId !== menuItemId),
      })),
    }));
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        config,
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
