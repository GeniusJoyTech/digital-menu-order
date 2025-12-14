import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<CheckoutConfig>(loadCheckoutConfig);

  useEffect(() => {
    saveCheckoutConfig(config);
  }, [config]);

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

  return (
    <CheckoutContext.Provider
      value={{
        config,
        updateStep,
        addStep,
        deleteStep,
        reorderSteps,
        resetToDefault,
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
