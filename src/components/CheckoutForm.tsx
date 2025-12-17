import { useState, useMemo } from "react";
import { X, Plus, MapPin, Store, User, Phone, ChevronDown, ChevronUp, Users } from "lucide-react";
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
  globalRecipientName?: string;
  recipientNames?: Record<string, string>; // instanceId -> name
  customerPhone: string;
  // stepId -> instanceId -> selected option ids
  stepValues: Record<string, Record<string, string[]>>;
}

const CheckoutForm = ({ isTable, tableNumber, cartItems, onSubmit, onClose }: CheckoutFormProps) => {
  const { config: menuConfig } = useMenu();
  const { config: checkoutConfig } = useCheckout();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("pickup");
  const [address, setAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Name mode: "single" = one name for all, "multiple" = per item
  const [nameMode, setNameMode] = useState<"single" | "multiple" | null>(null);
  const [globalRecipientName, setGlobalRecipientName] = useState("");
  const [recipientNames, setRecipientNames] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    cartItems.forEach(item => {
      initial[item.instanceId] = "";
    });
    return initial;
  });
  
  // stepId -> instanceId -> selectedOptionIds[]
  const [stepValues, setStepValues] = useState<Record<string, Record<string, string[]>>>({});
  // Track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {};
    cartItems.forEach(item => {
      expanded[item.instanceId] = true;
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

  // Filter steps based on enabled status and conditions
  const visibleSteps = useMemo(() => {
    return checkoutConfig.steps.filter(step => {
      if (!step.enabled) return false;
      if (isTable && step.type === "delivery") return false;
      if (isTable && !step.showForTable) return false;
      if (!isTable && step.skipForPickup && deliveryType === "pickup") return false;
      
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

  const isPerItemStep = (step: CheckoutStep) => {
    return step.type === "extras" || step.type === "drinks" || step.type === "custom_select";
  };

  // Get cart items relevant to this step
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

  const handleStepValueChange = (step: CheckoutStep, instanceId: string, optionId: string) => {
    setStepValues(prev => {
      const stepData = prev[step.id] || {};
      const itemData = stepData[instanceId] || [];
      
      if (step.multiSelect) {
        const isSelected = itemData.includes(optionId);
        
        if (!isSelected && step.maxSelectionsEnabled && step.maxSelections) {
          if (itemData.length >= step.maxSelections) {
            return prev;
          }
        }
        
        return {
          ...prev,
          [step.id]: {
            ...stepData,
            [instanceId]: isSelected
              ? itemData.filter(id => id !== optionId)
              : [...itemData, optionId]
          }
        };
      } else {
        return {
          ...prev,
          [step.id]: {
            ...stepData,
            [instanceId]: [optionId]
          }
        };
      }
    });
  };

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
        globalRecipientName: nameMode === "single" ? globalRecipientName : undefined,
        recipientNames: nameMode === "multiple" ? recipientNames : undefined,
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
      if (customerPhone.trim().length < 10) return false;
      
      if (nameMode === null) return false;
      
      if (nameMode === "single") {
        if (globalRecipientName.trim().length < 2) return false;
      } else {
        // All items need a name
        const allHaveNames = cartItems.every(item => 
          (recipientNames[item.instanceId] || "").trim().length >= 2
        );
        if (!allHaveNames) return false;
      }
    }
    
    if (currentStep.required && isPerItemStep(currentStep)) {
      const relevantItems = getRelevantCartItems(currentStep);
      const stepData = stepValues[currentStep.id] || {};
      
      const hasAnySelection = relevantItems.some(item => {
        const values = stepData[item.instanceId] || [];
        return values.length > 0 && !values.includes("none");
      });
      
      if (!hasAnySelection) return false;
    }
    
    return true;
  };

  const toggleItemExpanded = (instanceId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [instanceId]: !prev[instanceId]
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

    // Name step - with single vs multiple option
    if (currentStep.type === "name") {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            {currentStep.title}
          </h3>
          
          {/* Phone field */}
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

          {/* Name mode selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Quem vai receber?
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNameMode("single")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  nameMode === "single"
                    ? "border-brand-pink bg-pastel-pink"
                    : "border-border bg-card hover:border-brand-pink/50"
                )}
              >
                <User className="w-6 h-6 text-brand-pink" />
                <span className="font-medium text-foreground text-sm">Uma pessoa</span>
              </button>
              
              <button
                onClick={() => setNameMode("multiple")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  nameMode === "multiple"
                    ? "border-brand-pink bg-pastel-pink"
                    : "border-border bg-card hover:border-brand-pink/50"
                )}
              >
                <Users className="w-6 h-6 text-brand-pink" />
                <span className="font-medium text-foreground text-sm">Várias pessoas</span>
              </button>
            </div>
          </div>

          {/* Single name input */}
          {nameMode === "single" && (
            <div className="space-y-2 animate-scale-in">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome para todos os itens
              </label>
              <input
                type="text"
                value={globalRecipientName}
                onChange={(e) => setGlobalRecipientName(e.target.value)}
                placeholder="Digite o nome..."
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
          )}

          {/* Multiple names - per item */}
          {nameMode === "multiple" && (
            <div className="space-y-3 animate-scale-in max-h-[40vh] overflow-y-auto">
              <label className="text-sm font-medium text-foreground">
                Nome para cada item:
              </label>
              {cartItems.map((item, idx) => (
                <div key={item.instanceId} className="flex gap-3 items-center p-3 bg-pastel-pink rounded-xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-card"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.name} ({item.selectedSize})
                    </p>
                    <input
                      type="text"
                      value={recipientNames[item.instanceId] || ""}
                      onChange={(e) => setRecipientNames(prev => ({
                        ...prev,
                        [item.instanceId]: e.target.value
                      }))}
                      placeholder={`Nome do destinatário ${idx + 1}...`}
                      className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Selection steps - PER ITEM INSTANCE
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
            {relevantItems.map((cartItem, itemIdx) => {
              const isExpanded = expandedItems[cartItem.instanceId] ?? true;
              const selectedValues = stepValues[currentStep.id]?.[cartItem.instanceId] || [];
              const maxReached = currentStep.maxSelectionsEnabled && currentStep.maxSelections 
                ? selectedValues.length >= currentStep.maxSelections 
                : false;
              
              // Show item number if multiple of same product
              const sameProductCount = cartItems.filter(ci => ci.id === cartItem.id).length;
              const itemIndex = cartItems.filter(ci => ci.id === cartItem.id).findIndex(ci => ci.instanceId === cartItem.instanceId) + 1;

              return (
                <div key={cartItem.instanceId} className="border border-border rounded-xl overflow-hidden">
                  {/* Item Header */}
                  <button
                    onClick={() => toggleItemExpanded(cartItem.instanceId)}
                    className="w-full flex items-center gap-3 p-3 bg-pastel-pink hover:bg-pastel-pink/80 transition-colors"
                  >
                    <img
                      src={cartItem.image}
                      alt={cartItem.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-card"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-foreground text-sm">
                        {cartItem.name} {sameProductCount > 1 ? `(${itemIndex}/${sameProductCount})` : ""}
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
                            onClick={() => !isDisabled && handleStepValueChange(currentStep, cartItem.instanceId, option.id)}
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
                              </span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-sm text-brand-pink font-medium">
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
      const currentValue = stepValues[currentStep.id]?.["_global"]?.[0] || "";
      
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
            value={currentValue}
            onChange={(e) => handleGlobalStepValueChange(currentStep, e.target.value)}
            placeholder="Digite aqui..."
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink resize-none"
            rows={4}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-lg animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-3 flex-shrink-0">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display text-2xl text-brand-pink">
              Finalizar Pedido
            </h2>
            <p className="text-sm text-muted-foreground">
              {isTable ? `Mesa ${tableNumber} • ` : ""}Etapa {currentStepIndex + 1} de {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 flex-shrink-0">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-pink transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl font-medium border-2 border-border text-foreground hover:bg-muted transition-colors"
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
              {currentStepIndex === totalSteps - 1 ? "Enviar Pedido" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;