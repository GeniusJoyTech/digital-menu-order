import { useState, useMemo } from "react";
import { X, Plus, MapPin, Store, User, Phone } from "lucide-react";
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
  stepValues: Record<string, string[]>; // step.id -> selected option ids
}

const CheckoutForm = ({ isTable, tableNumber, cartItems, onSubmit, onClose }: CheckoutFormProps) => {
  const { config: menuConfig } = useMenu();
  const { config: checkoutConfig } = useCheckout();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("pickup");
  const [address, setAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [stepValues, setStepValues] = useState<Record<string, string[]>>({});

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

  const handleStepValueChange = (step: CheckoutStep, optionId: string) => {
    setStepValues(prev => {
      if (step.multiSelect) {
        const current = prev[step.id] || [];
        const isSelected = current.includes(optionId);
        
        // If trying to add and max is reached, don't add
        if (!isSelected && step.maxSelectionsEnabled && step.maxSelections) {
          if (current.length >= step.maxSelections) {
            return prev;
          }
        }
        
        return {
          ...prev,
          [step.id]: isSelected
            ? current.filter(id => id !== optionId)
            : [...current, optionId]
        };
      } else {
        return { ...prev, [step.id]: [optionId] };
      }
    });
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
    
    if (currentStep.required) {
      if (currentStep.type === "extras" || currentStep.type === "drinks" || currentStep.type === "custom_select") {
        const values = stepValues[currentStep.id] || [];
        if (values.length === 0 || (values.length === 1 && values[0] === "none")) return false;
      }
    }
    
    return true;
  };

  const getStepOptions = (step: CheckoutStep) => {
    if (step.type === "extras") {
      return menuConfig.extras.map(e => ({ ...e, stock: e.stock }));
    }
    if (step.type === "drinks") {
      return menuConfig.drinkOptions;
    }
    return step.options;
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

    // Selection steps (extras, drinks, custom_select)
    if (currentStep.type === "extras" || currentStep.type === "drinks" || currentStep.type === "custom_select") {
      const options = getStepOptions(currentStep);
      const selectedValues = stepValues[currentStep.id] || [];
      const maxReached = currentStep.maxSelectionsEnabled && currentStep.maxSelections 
        ? selectedValues.length >= currentStep.maxSelections 
        : false;
      
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
          {currentStep.maxSelectionsEnabled && currentStep.maxSelections && (
            <p className="text-center text-sm text-brand-pink font-medium">
              {selectedValues.length} de {currentStep.maxSelections} selecionado(s)
            </p>
          )}
          
          <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto">
            {options.map((option) => {
              const isOutOfStock = option.stock === 0 && option.id !== "none";
              const isSelected = selectedValues.includes(option.id);
              const isDisabled = isOutOfStock || (maxReached && !isSelected);
              
              return (
                <button
                  key={option.id}
                  onClick={() => !isDisabled && handleStepValueChange(currentStep, option.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
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
                    <span className={cn("font-medium text-foreground", isOutOfStock && "line-through")}>
                      {option.name}
                      {isOutOfStock && <span className="ml-2 text-xs text-destructive">(Esgotado)</span>}
                    </span>
                  </div>
                  {option.price > 0 && (
                    <span className="text-brand-pink font-bold">
                      +R$ {option.price.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Custom text step
    if (currentStep.type === "custom_text") {
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
            value={(stepValues[currentStep.id] || [])[0] || ""}
            onChange={(e) => setStepValues(prev => ({ ...prev, [currentStep.id]: [e.target.value] }))}
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