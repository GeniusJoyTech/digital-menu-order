import { useState } from "react";
import { X, Plus, MapPin, Store, User, Coffee } from "lucide-react";
import { useMenu } from "@/contexts/MenuContext";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  isTable: boolean;
  tableNumber: string;
  onSubmit: (data: CheckoutData) => void;
  onClose: () => void;
}

export interface CheckoutData {
  deliveryType: "delivery" | "pickup" | "table";
  address?: string;
  recipientName: string;
  nameOnCup: boolean;
  turbinarItems: string[];
  extraDrink: string | null;
}

const CheckoutForm = ({ isTable, tableNumber, onSubmit, onClose }: CheckoutFormProps) => {
  const { config } = useMenu();
  
  const turbinarOptions = config.extras;
  const drinkOptions = config.drinkOptions;
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("pickup");
  const [address, setAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [nameOnCup, setNameOnCup] = useState(false);
  const [turbinarItems, setTurbinarItems] = useState<string[]>([]);
  const [extraDrink, setExtraDrink] = useState<string | null>("none");

  const totalSteps = isTable ? 3 : 4;

  const handleTurbinarToggle = (itemId: string) => {
    setTurbinarItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit({
        deliveryType: isTable ? "table" : deliveryType,
        address: deliveryType === "delivery" ? address : undefined,
        recipientName,
        nameOnCup,
        turbinarItems,
        extraDrink: extraDrink === "none" ? null : extraDrink,
      });
    }
  };

  const canProceed = () => {
    if (!isTable && step === 1) {
      if (deliveryType === "delivery" && address.trim().length < 5) return false;
    }
    if ((!isTable && step === 2) || (isTable && step === 1)) {
      if (recipientName.trim().length < 2) return false;
    }
    return true;
  };

  const renderStep = () => {
    // For table orders: 1=name, 2=turbinar, 3=drink
    // For delivery/pickup: 1=address/type, 2=name, 3=turbinar, 4=drink
    
    if (!isTable && step === 1) {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            Como deseja receber?
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

    const nameStep = isTable ? 1 : 2;
    const turbinarStep = isTable ? 2 : 3;
    const drinkStep = isTable ? 3 : 4;

    if (step === nameStep) {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            Quem vai receber?
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

          <div className="flex items-center gap-3 p-4 rounded-xl bg-pastel-pink">
            <button
              onClick={() => setNameOnCup(!nameOnCup)}
              className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                nameOnCup
                  ? "bg-brand-pink border-brand-pink"
                  : "bg-card border-border"
              )}
            >
              {nameOnCup && <span className="text-primary-foreground text-sm">✓</span>}
            </button>
            <div>
              <p className="font-medium text-foreground">Quer o nome no copo?</p>
              <p className="text-xs text-muted-foreground">
                Personalizamos o copo com seu nome! ✨
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (step === turbinarStep) {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center">
            Quer turbinar seu Milk Shake?
          </h3>
          <p className="text-center text-sm text-muted-foreground">
            Adicione extras especiais! (opcional)
          </p>
          
          <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto">
            {turbinarOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTurbinarToggle(item.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                  turbinarItems.includes(item.id)
                    ? "border-brand-pink bg-pastel-pink"
                    : "border-border bg-card hover:border-brand-pink/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus className={cn(
                    "w-5 h-5 transition-transform",
                    turbinarItems.includes(item.id) ? "rotate-45 text-brand-pink" : "text-muted-foreground"
                  )} />
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <span className="text-brand-pink font-bold">
                  +R$ {item.price.toFixed(2).replace(".", ",")}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === drinkStep) {
      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-brand-pink text-center flex items-center justify-center gap-2">
            <Coffee className="w-5 h-5" />
            Quer água ou refrigerante?
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            {drinkOptions.map((drink) => (
              <button
                key={drink.id}
                onClick={() => setExtraDrink(drink.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  extraDrink === drink.id
                    ? "border-brand-pink bg-pastel-pink"
                    : "border-border bg-card hover:border-brand-pink/50"
                )}
              >
                <span className="font-medium text-foreground">{drink.name}</span>
                {drink.price > 0 && (
                  <span className="text-brand-pink font-bold">
                    +R$ {drink.price.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

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
              Passo {step} de {totalSteps}
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
                  i < step ? "bg-brand-pink" : "bg-muted"
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
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
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
              {step === totalSteps ? "Confirmar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
