import { useState, useMemo } from "react";
import { X, Plus, MapPin, Store, User, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useMenu } from "@/contexts/MenuContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { CartItem } from "@/data/menuData";
import { CheckoutStep } from "@/data/checkoutConfig";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  isTable: boolean;
  tableNumber: string;
  cartItems: CartItem[];
  onSubmit: (data: CheckoutData) => void;
  onClose: () => void;
}

export interface CheckoutData {
  deliveryType: "delivery" | "pickup" | "table";
  address?: string;
  recipientName: string;
  customerPhone: string;
  // stepId -> cartItemKey -> selected option ids
  stepValues: Record<string, Record<string, string[]>>;
}

// Unique key for cart item
const getCartItemKey = (item: CartItem) => `${item.id}-${item.selectedSize}`;

const CheckoutForm = ({ isTable, tableNumber, cartItems, onSubmit, onClose }: CheckoutFormProps) => {
  const { config: menuConfig } = useMenu();
  const { config: checkoutConfig } = useCheckout();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("pickup");
  const [address, setAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // New structure: stepId -> cartItemKey -> selectedOptionIds[]
  const [stepValues, setStepValues] = useState<Record<string, Record<string, string[]>>>({});
  // Track which cart items are expanded in the UI
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    // Start with all items expanded
    const expanded: Record<string, boolean> = {};
    cartItems.forEach(item => {
      expanded[getCartItemKey(item)] = true;
    });
    return expanded;
  });

  // Get cart item IDs and category IDs for conditional step visibility
  const cartItemIds = useMemo(() => cartItems.map(item => item.id), [cartItems]);
  const cartCategoryIds = useMemo(() => {
    const categoryIds = new Set<string>();
    cartItems.forEach(item => {
      if (item.category) {
        categoryIds.add(item.category);
      }
    });
    return Array.from(categoryIds);
  }, [cartItems]);

  // Filter steps based on enabled status, table/delivery context, and conditional visibility
  const visibleSteps = useMemo(() => {
    return checkoutConfig.steps.filter(step => {
      if (!step.enabled) return false;
      // Skip delivery step for table orders - they don't need address
      if (isTable && step.type === "delivery") return false;
      if (isTable && !step.showForTable) return false;
      if (!isTable && step.skipForPickup && deliveryType === "pickup") return false;
      
      // Check conditional visibility
      if (step.showCondition === "specific_items" && step.triggerItemIds?.length) {
        const hasMatchingItem = step.triggerItemIds.some(id => cartItemIds.includes(id));
        if (!hasMatchingItem) return false;
      }
      
      if (step.showCondition === "specific_categories" && step.triggerCategoryIds?.length) {
        const hasMatchingCategory = step.triggerCategoryIds.some(id => cartCategoryIds.includes(id));
        if (!hasMatchingCategory) return false;
      }
      
      if (step.showCondition === "items_and_categories") {
        const hasMatchingItem = step.triggerItemIds?.length ? step.triggerItemIds.some(id => cartItemIds.includes(id)) : false;
        const hasMatchingCategory = step.triggerCategoryIds?.length ? step.triggerCategoryIds.some(id => cartCategoryIds.includes(id)) : false;
        if (!hasMatchingItem && !hasMatchingCategory) return false;
      }
      
      return true;
    });
  }, [checkoutConfig.steps, isTable, deliveryType, cartItemIds, cartCategoryIds]);

  const totalSteps = visibleSteps.length;
  const currentStep = visibleSteps[currentStepIndex];

  // Check if step should show per-item options (selection steps)
  const isPerItemStep = (step: CheckoutStep) => {
    return step.type === "extras" || step.type === "drinks" || step.type === "custom_select";
  };

  // Get cart items relevant to this step (based on triggers)
  const getRelevantCartItems = (step: CheckoutStep): CartItem[] => {
    if (step.showCondition === "always") {
      return cartItems;
    }
    
    return cartItems.filter(item => {
      if (step.showCondition === "specific_items" && step.triggerItemIds?.length) {
        return step.triggerItemIds.includes(item.id);
      }
      if (step.showCondition === "specific_categories" && step.triggerCategoryIds?.length) {
        return step.triggerCategoryIds.includes(item.category || "");
      }
      if (step.showCondition === "items_and_categories") {
        const matchesItem = step.triggerItemIds?.includes(item.id);
        const matchesCategory = step.triggerCategoryIds?.includes(item.category || "");
        return matchesItem || matchesCategory;
      }
      return true;
    });
  };

  const handleStepValueChange = (step: CheckoutStep, cartItemKey: string, optionId: string) => {
    setStepValues(prev => {
      const stepData = prev[step.id] || {};
      const itemData = stepData[cartItemKey] || [];
      
      if (step.multiSelect) {
        const isSelected = itemData.includes(optionId);
        
        // If trying to add and max is reached, don't add
        if (!isSelected && step.maxSelectionsEnabled && step.maxSelections) {
          if (itemData.length >= step.maxSelections) {
            return prev;
          }
        }
        
        return {
          ...prev,
          [step.id]: {
            ...stepData,
            [cartItemKey]: isSelected
              ? itemData.filter(id => id !== optionId)
              : [...itemData, optionId]
          }
        };
      } else {
        return {
          ...prev,
          [step.id]: {
            ...stepData,
            [cartItemKey]: [optionId]
          }
        };
      }
    });
  };

  // Legacy handler for non-per-item steps (like custom_text)
  const handleGlobalStepValueChange = (step: CheckoutStep, value: string) => {
    setStepValues(prev => ({
      ...prev,
      [step.id]: {
        "_global": [value]
      }
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onSubmit({
        deliveryType: isTable ? "table" : deliveryType,
        address: deliveryType === "delivery" ? address : undefined,
        recipientName,
        customerPhone,
        stepValues,
      });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const canProceed = () => {
    if (!currentStep) return false;
    
    if (currentStep.type === "delivery") {
      if (deliveryType === "delivery" && address.trim().length < 5) return false;
    }
    
    if (currentStep.type === "name") {
      if (recipientName.trim().length < 2) return false;
      if (customerPhone.trim().length < 10) return false;
    }
    
    if (currentStep.required && isPerItemStep(currentStep)) {
      const relevantItems = getRelevantCartItems(currentStep);
      const stepData = stepValues[currentStep.id] || {};
      
      // Check if at least one item has a selection
      const hasAnySelection = relevantItems.some(item => {
        const key = getCartItemKey(item);
        const values = stepData[key] || [];
        return values.length > 0 && !values.includes("none");
      });
      
      if (!hasAnySelection) return false;
    }
    
    return true;
  };

  const toggleItemExpanded = (cartItemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [cartItemKey]: !prev[cartItemKey]
    }));
  };

  const getStepOptions = (step: CheckoutStep) => {
    const mergeById = <T extends { id: string; stock?: number }>(base: T[], extra: T[]): T[] => {
      const map = new Map(base.map((o) => [o.id, o] as const));
      extra.forEach((o) => {
        if (!map.has(o.id)) map.set(o.id, o);
      });
      return Array.from(map.values());
    };

    // Filter out items with stock === 0 (but keep undefined stock - means unlimited)
    const filterInStock = <T extends { id: string; stock?: number }>(items: T[]): T[] => {
      return items.filter(item => item.stock === undefined || item.stock > 0);
    };

    const stepExclusive = (step.options || []) as any[];

    if (step.type === "extras") {
      const base = menuConfig.extras.map((e) => ({ ...e, stock: e.stock }));
      return filterInStock(mergeById(base, stepExclusive as any));
    }
    if (step.type === "drinks") {
      return filterInStock(mergeById(menuConfig.drinkOptions, stepExclusive as any));
    }
    // For custom_select steps, also filter out of stock items
    return filterInStock(step.options || []);
  };

  const renderStep = () => {
    if (!currentStep) return null;

    // Delivery step
    if (currentStep.type === "delivery") {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            {currentStep.title}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryType("pickup")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                deliveryType === "pickup"
                  ? "border-brand-pink bg-pastel-pink"
                  : "border-border bg-card hover:border-brand-pink/50"
              )}
            >
              <Store className="w-8 h-8 text-brand-pink" />
              <span className="font-medium text-foreground">Retirar na loja</span>
            </button>
            
            <button
              onClick={() => setDeliveryType("delivery")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                deliveryType === "delivery"
                  ? "border-brand-pink bg-pastel-pink"
                  : "border-border bg-card hover:border-brand-pink/50"
              )}
            >
              <MapPin className="w-8 h-8 text-brand-pink" />
              <span className="font-medium text-foreground">Delivery</span>
            </button>
          </div>

          {deliveryType === "delivery" && (
            <div className="space-y-2 animate-scale-in">
              <label className="text-sm font-medium text-foreground">
                Endereço completo
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, complemento..."
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      );
    }

    // Name step
    if (currentStep.type === "name") {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            {currentStep.title}
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <p className="text-xs text-muted-foreground">
              Usaremos para confirmar seu pedido
            </p>
          </div>
        </div>
      );
    }

    // Selection steps (extras, drinks, custom_select) - PER ITEM
    if (isPerItemStep(currentStep)) {
      const options = getStepOptions(currentStep);
      const relevantItems = getRelevantCartItems(currentStep);
      
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            {currentStep.title}
          </h3>
          {currentStep.subtitle && (
            <p className="text-center text-sm text-muted-foreground">
              {currentStep.subtitle}
            </p>
          )}
          
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {relevantItems.map((cartItem) => {
              const cartItemKey = getCartItemKey(cartItem);
              const isExpanded = expandedItems[cartItemKey] ?? true;
              const selectedValues = stepValues[currentStep.id]?.[cartItemKey] || [];
              const maxReached = currentStep.maxSelectionsEnabled && currentStep.maxSelections 
                ? selectedValues.length >= currentStep.maxSelections 
                : false;

              return (
                <div key={cartItemKey} className="border border-border rounded-xl overflow-hidden">
                  {/* Cart Item Header */}
                  <button
                    onClick={() => toggleItemExpanded(cartItemKey)}
                    className="w-full flex items-center gap-3 p-3 bg-pastel-pink hover:bg-pastel-pink/80 transition-colors"
                  >
                    <img
                      src={cartItem.image}
                      alt={cartItem.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-card"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-foreground text-sm">
                        {cartItem.quantity}x {cartItem.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {cartItem.selectedSize}
                        {selectedValues.length > 0 && (
                          <span className="ml-2 text-brand-pink">
                            • {selectedValues.length} selecionado(s)
                          </span>
                        )}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Options for this item */}
                  {isExpanded && (
                    <div className="p-3 space-y-2 bg-card">
                      {currentStep.maxSelectionsEnabled && currentStep.maxSelections && (
                        <p className="text-center text-xs text-brand-pink font-medium mb-2">
                          {selectedValues.length} de {currentStep.maxSelections} selecionado(s)
                        </p>
                      )}
                      
                      {options.map((option) => {
                        const isOutOfStock = option.stock === 0 && option.id !== "none";
                        const isSelected = selectedValues.includes(option.id);
                        const isDisabled = isOutOfStock || (maxReached && !isSelected);
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => !isDisabled && handleStepValueChange(currentStep, cartItemKey, option.id)}
                            disabled={isDisabled}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                              isDisabled && !isSelected
                                ? "border-border bg-muted opacity-50 cursor-not-allowed"
                                : isSelected
                                  ? "border-brand-pink bg-pastel-pink"
                                  : "border-border bg-card hover:border-brand-pink/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {currentStep.multiSelect && (
                                <Plus className={cn(
                                  "w-5 h-5 transition-transform",
                                  isSelected ? "rotate-45 text-brand-pink" : "text-muted-foreground"
                                )} />
                              )}
                              <span className={cn("font-medium text-foreground text-sm", isOutOfStock && "line-through")}>
                                {option.name}
                                {isOutOfStock && <span className="ml-2 text-xs text-destructive">(Esgotado)</span>}
                              </span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-brand-pink font-bold text-sm">
                                +R$ {option.price.toFixed(2).replace(".", ",")}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Custom text step
    if (currentStep.type === "custom_text") {
      const globalValue = stepValues[currentStep.id]?.["_global"]?.[0] || "";
      
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            {currentStep.title}
          </h3>
          {currentStep.subtitle && (
            <p className="text-center text-sm text-muted-foreground">
              {currentStep.subtitle}
            </p>
          )}
          
          <textarea
            value={globalValue}
            onChange={(e) => handleGlobalStepValueChange(currentStep, e.target.value)}
            placeholder="Digite aqui..."
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink resize-none"
            rows={3}
          />
        </div>
      );
    }

    return null;
  };

  if (totalSteps === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-h-[90vh] bg-card rounded-t-3xl shadow-lg animate-slide-up overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
          <div>
            <h2 className="font-display text-2xl text-brand-pink">
              Finalizar Pedido
            </h2>
            <p className="text-sm text-muted-foreground">
              Passo {currentStepIndex + 1} de {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  i <= currentStepIndex ? "bg-brand-pink" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl font-bold border-2 border-border text-foreground hover:bg-muted transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                canProceed()
                  ? "bg-brand-pink text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {currentStepIndex === totalSteps - 1 ? "Confirmar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
