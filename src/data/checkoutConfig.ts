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
  trackStock?: boolean; // Whether this option should be tracked in stock management
}

export type PricingRuleType = "per_item" | "flat_after_limit" | "per_item_after_limit";

export interface PricingRule {
  enabled: boolean;
  freeItemsLimit: number; // Number of free items before charging
  ruleType: PricingRuleType;
  pricePerItem: number; // Price per item (used for "per_item" and "per_item_after_limit")
  flatPrice: number; // Flat price after limit (used for "flat_after_limit")
}

export interface LinkedMenuItem {
  itemId: string;
  excludeFromStock: boolean; // When true, this item won't appear in stock management
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
  showCondition: "always" | "specific_items" | "specific_categories" | "items_and_categories"; // When to show this step
  triggerItemIds?: string[]; // Item IDs that trigger this step (when showCondition includes items)
  triggerCategoryIds?: string[]; // Category IDs that trigger this step (when showCondition includes categories)
  pricingRule?: PricingRule; // Optional pricing rules for multi-select steps
  maxSelectionsEnabled?: boolean; // Whether to limit the number of selections
  maxSelections?: number; // Maximum number of selections allowed (when maxSelectionsEnabled is true)
  linkedMenuItems?: LinkedMenuItem[]; // Menu items linked to this step
}

const STORAGE_KEY = "shakeyes_checkout_config";

// Built-in steps must use UUIDs because the backend schema uses uuid PKs.
export const BUILTIN_STEP_IDS = {
  delivery: "00000000-0000-0000-0000-000000000001",
  name: "00000000-0000-0000-0000-000000000002",
  extras: "00000000-0000-0000-0000-000000000003",
  drinks: "00000000-0000-0000-0000-000000000004",
} as const;

export const defaultCheckoutSteps: CheckoutStep[] = [
  {
    id: BUILTIN_STEP_IDS.delivery,
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
    id: BUILTIN_STEP_IDS.name,
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
    id: BUILTIN_STEP_IDS.extras,
    type: "extras",
    title: "Quer turbinar seu Milk Shake?",
    subtitle: "Adicione extras especiais! (opcional)",
    enabled: true,
    required: false,
    multiSelect: true,
    options: [], // Uses extras from MenuConfig
    showForTable: true,
    showCondition: "always",
  },
  {
    id: BUILTIN_STEP_IDS.drinks,
    type: "drinks",
    title: "Quer água ou refrigerante?",
    subtitle: undefined,
    enabled: true,
    required: false,
    multiSelect: false,
    options: [], // Uses drinkOptions from MenuConfig
    showForTable: true,
    showCondition: "always",
  },
];

export interface CheckoutConfig {
  steps: CheckoutStep[];
}

const defaultStepsById = new Map(defaultCheckoutSteps.map((s) => [s.id, s] as const));

const normalizeOption = (o: any): CheckoutStepOption => ({
  id: String(o?.id ?? ""),
  name: String(o?.name ?? ""),
  price: typeof o?.price === "number" ? o.price : parseFloat(o?.price) || 0,
  stock: o?.stock === undefined || o?.stock === null ? undefined : (typeof o.stock === "number" ? o.stock : parseInt(o.stock) || 0),
  trackStock: Boolean(o?.trackStock),
});

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const normalizeStep = (s: any): CheckoutStep => {
  const raw = s || {};
  const rawType = (raw?.type ?? "custom_select") as CheckoutStepType;

  // Force UUID ids for built-in steps, regardless of legacy ids.
  const normalizedId =
    rawType === "delivery"
      ? BUILTIN_STEP_IDS.delivery
      : rawType === "name"
        ? BUILTIN_STEP_IDS.name
        : String(raw?.id ?? "");

  const fallback = defaultStepsById.get(normalizedId);

  const base: CheckoutStep = fallback
    ? { ...fallback }
    : {
        id: normalizedId,
        type: rawType,
        title: String(raw?.title ?? ""),
        subtitle: raw?.subtitle,
        enabled: true,
        required: false,
        multiSelect: false,
        options: [],
        showForTable: true,
        showCondition: "always",
        triggerItemIds: [],
        triggerCategoryIds: [],
        pricingRule: raw?.pricingRule,
        maxSelectionsEnabled: false,
        maxSelections: 3,
        linkedMenuItems: [],
      };

  // Merge but keep our normalized id/type
  const merged = { ...base, ...(raw || {}) } as CheckoutStep;

  // If a non-built-in step has a non-uuid id (legacy), upgrade it so it can be persisted in the backend.
  const safeId =
    rawType === "delivery" || rawType === "name"
      ? normalizedId
      : isUuid(String(merged.id || ""))
        ? String(merged.id)
        : crypto.randomUUID();

  return {
    ...merged,
    id: safeId,
    type: rawType,
    enabled: merged.enabled ?? true,
    required: merged.required ?? false,
    multiSelect: merged.multiSelect ?? false,
    options: Array.isArray(merged.options) ? merged.options.map(normalizeOption) : [],
    showForTable: merged.showForTable ?? base.showForTable,
    showCondition: (merged.showCondition ?? "always") as any,
    triggerItemIds: Array.isArray(merged.triggerItemIds) ? merged.triggerItemIds : [],
    triggerCategoryIds: Array.isArray(merged.triggerCategoryIds) ? merged.triggerCategoryIds : [],
    maxSelectionsEnabled: merged.maxSelectionsEnabled ?? false,
    maxSelections: merged.maxSelections ?? 3,
    linkedMenuItems: Array.isArray(merged.linkedMenuItems)
      ? merged.linkedMenuItems.map((l: any) => ({ itemId: String(l?.itemId ?? ""), excludeFromStock: Boolean(l?.excludeFromStock) }))
      : [],
  };
};

const normalizeCheckoutConfig = (raw: any): CheckoutConfig => {
  const rawSteps = Array.isArray(raw?.steps) ? raw.steps : [];
  const normalized = rawSteps.map(normalizeStep).filter((s) => s.id);

  // Ensure required built-in steps always exist (by type)
  const hasDelivery = normalized.some((s) => s.type === "delivery");
  const hasName = normalized.some((s) => s.type === "name");

  const ensured: CheckoutStep[] = [];
  if (!hasDelivery) ensured.push({ ...defaultCheckoutSteps.find((s) => s.type === "delivery")! });
  if (!hasName) ensured.push({ ...defaultCheckoutSteps.find((s) => s.type === "name")! });

  return { steps: [...ensured, ...normalized] };
};

export const loadCheckoutConfig = (): CheckoutConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return normalizeCheckoutConfig(parsed);
    }
  } catch (error) {
    console.error("Error loading checkout config:", error);
  }
  return { steps: defaultCheckoutSteps };
};

export const saveCheckoutConfig = (config: CheckoutConfig): void => {
  try {
    const normalized = normalizeCheckoutConfig(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Error saving checkout config:", error);
  }
};

export const resetCheckoutConfig = (): CheckoutConfig => {
  localStorage.removeItem(STORAGE_KEY);
  return { steps: defaultCheckoutSteps };
};
