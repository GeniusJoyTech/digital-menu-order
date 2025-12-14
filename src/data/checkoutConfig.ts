export type CheckoutStepType = 
  | "delivery" 
  | "name" 
  | "extras" 
  | "drinks" 
  | "custom_select" 
  | "custom_text";

export interface CheckoutStepOption {
  id: string;
  name: string;
  price: number;
  stock?: number;
}

export interface CheckoutStep {
  id: string;
  type: CheckoutStepType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  required: boolean;
  multiSelect: boolean;
  options: CheckoutStepOption[];
  showForTable: boolean; // Whether to show this step for table orders
  skipForPickup?: boolean; // Skip for pickup orders (only show for delivery)
}

const STORAGE_KEY = "shakeyes_checkout_config";

export const defaultCheckoutSteps: CheckoutStep[] = [
  {
    id: "delivery",
    type: "delivery",
    title: "Como deseja receber?",
    subtitle: undefined,
    enabled: true,
    required: true,
    multiSelect: false,
    options: [],
    showForTable: false,
  },
  {
    id: "name",
    type: "name",
    title: "Quem vai receber?",
    subtitle: undefined,
    enabled: true,
    required: true,
    multiSelect: false,
    options: [],
    showForTable: true,
  },
  {
    id: "turbinar-shake",
    type: "extras",
    title: "Quer turbinar seu Milk Shake?",
    subtitle: "Adicione extras especiais! (opcional)",
    enabled: true,
    required: false,
    multiSelect: true,
    options: [], // Uses extras from MenuConfig
    showForTable: true,
  },
  {
    id: "bebida-extra",
    type: "drinks",
    title: "Quer água ou refrigerante?",
    subtitle: undefined,
    enabled: true,
    required: false,
    multiSelect: false,
    options: [], // Uses drinkOptions from MenuConfig
    showForTable: true,
  },
];

export interface CheckoutConfig {
  steps: CheckoutStep[];
}

export const loadCheckoutConfig = (): CheckoutConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        steps: parsed.steps || defaultCheckoutSteps,
      };
    }
  } catch (error) {
    console.error("Error loading checkout config:", error);
  }
  return { steps: defaultCheckoutSteps };
};

export const saveCheckoutConfig = (config: CheckoutConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving checkout config:", error);
  }
};

export const resetCheckoutConfig = (): CheckoutConfig => {
  localStorage.removeItem(STORAGE_KEY);
  return { steps: defaultCheckoutSteps };
};
