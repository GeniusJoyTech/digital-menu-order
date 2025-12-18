import { useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingBag, Trash2, Send, X } from "lucide-react";
import { CartItem } from "@/data/menuData";
import { useMenu } from "@/contexts/MenuContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useDesign } from "@/contexts/DesignContext";
import { cn } from "@/lib/utils";
import CheckoutForm, { CheckoutData } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";
import { decreaseOrderStock } from "@/services/supabaseStockService";
import { toast } from "sonner";

interface CartProps {
  items: CartItem[];
  onRemoveItem: (instanceId: string) => void;
  onClearCart: () => void;
}

const Cart = ({ items, onRemoveItem, onClearCart }: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { config } = useMenu();
  const { config: checkoutConfig } = useCheckout();
  const { design } = useDesign();
  const { mesa } = useParams();
  const isTable = mesa?.startsWith("mesa-");
  const tableNumber = mesa?.replace("mesa-", "") || null;

  const totalItems = items.length;
  const totalPrice = items.reduce((acc, item) => acc + item.selectedPrice, 0);

  // Group items for display in cart (by id + size)
  const groupedItems = items.reduce((acc, item) => {
    const key = `${item.id}-${item.selectedSize}`;
    if (!acc[key]) {
      acc[key] = {
        ...item,
        instances: [item],
        quantity: 1,
      };
    } else {
      acc[key].instances.push(item);
      acc[key].quantity += 1;
    }
    return acc;
  }, {} as Record<string, CartItem & { instances: CartItem[]; quantity: number }>);

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    const whatsappNumber = design.whatsappNumber || "15998343599";
    const phoneNumber = `55${whatsappNumber.replace(/\D/g, "")}`;
    
    // Calculate extras total from stepValues (per-instance structure)
    let extrasTotal = 0;
    const extrasSelected: { id?: string; name: string; price: number; instanceId?: string }[] = [];
    const drinksSelected: { id?: string; name: string; price: number; instanceId?: string }[] = [];

    // Process step values to get extras, drinks, and custom options
    // Structure: stepId -> instanceId -> selectedOptionIds[]
    Object.entries(data.stepValues).forEach(([stepId, instanceSelections]) => {
      const step = checkoutConfig.steps.find(s => s.id === stepId);
      if (!step) return;

      // Process each instance's selections
      Object.entries(instanceSelections).forEach(([instanceId, selectedIds]) => {
        // Handle custom_select with pricing rules
        if (step.type === "custom_select" && step.pricingRule?.enabled) {
          const rule = step.pricingRule;
          const itemCount = selectedIds.length;
          
          selectedIds.forEach(optionId => {
            const customOption = step.options.find(o => o.id === optionId);
            if (customOption) {
              extrasSelected.push({ 
                id: customOption.id, 
                name: customOption.name, 
                price: 0,
                instanceId 
              });
            }
          });

          if (rule.ruleType === "per_item") {
            extrasTotal += itemCount * rule.pricePerItem;
          } else if (rule.ruleType === "per_item_after_limit") {
            const chargeableItems = Math.max(0, itemCount - rule.freeItemsLimit);
            extrasTotal += chargeableItems * rule.pricePerItem;
          } else if (rule.ruleType === "flat_after_limit") {
            if (itemCount > rule.freeItemsLimit) {
              extrasTotal += rule.flatPrice;
            }
          }
          return;
        }
        
        // Regular processing
        selectedIds.forEach(optionId => {
          const extra = config.extras.find(e => e.id === optionId);
          if (extra) {
            extrasTotal += extra.price;
            extrasSelected.push({ id: extra.id, name: extra.name, price: extra.price, instanceId });
            return;
          }
          
          if (optionId !== "none") {
            const drink = config.drinkOptions.find(d => d.id === optionId);
            if (drink) {
              extrasTotal += drink.price;
              drinksSelected.push({ id: drink.id, name: drink.name, price: drink.price, instanceId });
              return;
            }
          }
          
          if (step.type === "custom_select") {
            const customOption = step.options.find(o => o.id === optionId);
            if (customOption) {
              extrasTotal += customOption.price;
              extrasSelected.push({ 
                id: customOption.id, 
                name: customOption.name, 
                price: customOption.price, 
                instanceId 
              });
            }
          }
        });
      });
    });

    const finalTotal = totalPrice + extrasTotal;
    
    let message = "";
    
    if (isTable) {
      message = `*NOVO PEDIDO - MESA ${tableNumber}*\n`;
    } else if (data.deliveryType === "pickup") {
      message = `*NOVO PEDIDO - RETIRADA NA LOJA*\n`;
    } else {
      message = `*NOVO PEDIDO - DELIVERY*\n`;
    }
    
    message += `--------------------------------\n`;
    message += `Telefone: ${data.customerPhone}\n`;
    
    if (data.deliveryType === "delivery" && data.address) {
      message += `Endereco: ${data.address}\n`;
    }
    
    message += `--------------------------------\n\n`;
    message += `*ITENS:*\n\n`;
    
    // Build items message - show each instance with its recipient name
    items.forEach((item, index) => {
      const recipientName = data.recipientNames?.[item.instanceId] || data.globalRecipientName || "";
      message += `${index + 1}. ${item.name} (${item.selectedSize})\n`;
      message += `   Nome: ${recipientName}\n`;
      message += `   Valor: R$ ${item.selectedPrice.toFixed(2).replace(".", ",")}\n`;
      
      // Show extras for this specific instance
      const itemExtras = extrasSelected.filter(e => e.instanceId === item.instanceId);
      if (itemExtras.length > 0) {
        itemExtras.forEach(extra => {
          const priceStr = extra.price > 0 ? ` (+R$ ${extra.price.toFixed(2).replace(".", ",")})` : "";
          message += `   + ${extra.name}${priceStr}\n`;
        });
      }
      
      // Show drinks for this specific instance
      const itemDrinks = drinksSelected.filter(d => d.instanceId === item.instanceId);
      if (itemDrinks.length > 0) {
        itemDrinks.forEach(drink => {
          const priceStr = drink.price > 0 ? ` (+R$ ${drink.price.toFixed(2).replace(".", ",")})` : "";
          message += `   + ${drink.name}${priceStr}\n`;
        });
      }
      
      message += `\n`;
    });
    
    message += `--------------------------------\n`;
    message += `*TOTAL: R$ ${finalTotal.toFixed(2).replace(".", ",")}*\n`;
    
    if (isTable) {
      message += `Mesa: ${tableNumber}`;
    } else if (data.deliveryType === "pickup") {
      message += `Retirada na loja`;
    } else {
      message += `Delivery`;
    }

    // Prepare order items with IDs for stock tracking
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      size: item.selectedSize,
      quantity: 1,
      price: item.selectedPrice,
      recipientName: data.recipientNames?.[item.instanceId] || data.globalRecipientName || "",
    }));

    // Combine extras and drinks for order data (remove instanceId)
    const allExtras = [...extrasSelected, ...drinksSelected].map(({ instanceId, ...rest }) => rest);

    // Save order to Supabase
    const orderData = {
      customer_name: data.globalRecipientName || Object.values(data.recipientNames || {})[0] || "",
      customer_phone: data.customerPhone,
      delivery_type: isTable ? "table" : data.deliveryType,
      table_number: tableNumber || null,
      items: orderItems,
      extras: allExtras,
      drink: drinksSelected.length > 0 ? drinksSelected.map(d => d.name).join(", ") : null,
      observations: data.address || null,
      total: finalTotal,
      status: "pending" as const,
    };

    const { error } = await supabase
      .from("orders")
      .insert(orderData);
    
    if (error) {
      console.error("Error saving order:", error);
      toast.error("Erro ao salvar pedido");
      return;
    }
    
    // Decrease stock - count items by id
    const itemCounts: Record<string, number> = {};
    items.forEach(item => {
      itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
    });
    
    const allOptionsForStock = [...extrasSelected, ...drinksSelected]
      .filter(e => e.id)
      .map(e => ({ id: e.id || "", quantity: 1 }));
    
    await decreaseOrderStock(
      Object.entries(itemCounts).map(([id, quantity]) => ({ id, quantity })),
      allOptionsForStock
    );

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Pedido enviado com sucesso!");
    onClearCart();
    setShowCheckout(false);
    setIsOpen(false);
  };

  if (totalItems === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg transition-all duration-300",
          "bg-brand-pink text-primary-foreground hover:opacity-90 active:scale-95",
          totalItems > 0 ? "animate-bounce-soft" : ""
        )}
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-card text-foreground text-xs font-bold rounded-full">
              {totalItems}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-xs opacity-80">Ver Comanda</div>
          <div className="font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</div>
        </div>
      </button>

      {/* Cart Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[85vh] bg-card rounded-t-3xl shadow-lg transition-transform duration-500",
            isOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-2xl text-brand-pink">
                Sua Comanda
              </h2>
              <p className="text-sm text-muted-foreground">
                {isTable ? `Mesa ${tableNumber} • ` : ""}{totalItems} {totalItems === 1 ? "item" : "itens"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items - grouped display */}
          <div className="overflow-y-auto max-h-[50vh] px-6 py-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Sua comanda está vazia</p>
                <p className="text-sm text-muted-foreground/70">
                  Adicione itens do cardápio
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(groupedItems).map((group) => (
                  <div
                    key={`${group.id}-${group.selectedSize}`}
                    className="p-3 bg-pastel-pink rounded-xl animate-scale-in"
                  >
                    <div className="flex gap-3">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-card"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {group.quantity}x {group.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {group.selectedSize}
                        </p>
                        <p className="font-bold text-brand-pink text-sm mt-1">
                          R$ {(group.selectedPrice * group.quantity).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                    {/* Show individual items for removal */}
                    <div className="mt-2 space-y-1">
                      {group.instances.map((instance, idx) => (
                        <div key={instance.instanceId} className="flex items-center justify-between pl-4 py-1 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Item {idx + 1}</span>
                          <button
                            onClick={() => onRemoveItem(instance.instanceId)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-4 border-t border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-display text-brand-pink">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:bg-[#20bd5a] active:scale-[0.98] transition-all duration-300 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Enviar Pedido via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Form */}
      {showCheckout && (
        <CheckoutForm
          isTable={!!isTable}
          tableNumber={tableNumber || ""}
          cartItems={items}
          onSubmit={handleCheckoutSubmit}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default Cart;