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
  trackStock?: boolean;
}

export type PricingRuleType = "per_item" | "flat_after_limit" | "per_item_after_limit";

export interface PricingRule {
  enabled: boolean;
  freeItemsLimit: number;
  ruleType: PricingRuleType;
  pricePerItem: number;
  flatPrice: number;
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
  showForTable: boolean;
  skipForPickup?: boolean;
  showCondition: "always" | "specific_items" | "specific_categories" | "items_and_categories";
  triggerItemIds?: string[];
  triggerCategoryIds?: string[];
  pricingRule?: PricingRule;
  maxSelectionsEnabled?: boolean;
  maxSelections?: number;
}

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
    showCondition: "always",
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
    showCondition: "always",
  },
  {
    id: "turbinar-shake",
    type: "extras",
    title: "Quer turbinar seu Milk Shake?",
    subtitle: "Adicione extras especiais! (opcional)",
    enabled: true,
    required: false,
    multiSelect: true,
    options: [],
    showForTable: true,
    showCondition: "always",
  },
  {
    id: "bebida-extra",
    type: "drinks",
    title: "Quer água ou refrigerante?",
    subtitle: undefined,
    enabled: true,
    required: false,
    multiSelect: false,
    options: [],
    showForTable: true,
    showCondition: "always",
  },
];

export interface CheckoutConfig {
  steps: CheckoutStep[];
}

export const loadCheckoutConfig = (): CheckoutConfig => {
  return { steps: defaultCheckoutSteps };
};

export const saveCheckoutConfig = (config: CheckoutConfig): void => {
  console.log("Checkout config saved to API");
};

export const resetCheckoutConfig = (): CheckoutConfig => {
  return { steps: defaultCheckoutSteps };
};
