import { useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingBag, Plus, Minus, Trash2, Send, X } from "lucide-react";
import { CartItem } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, size: string, delta: number) => void;
  onRemoveItem: (itemId: string, size: string) => void;
  onClearCart: () => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mesa } = useParams();
  const tableNumber = mesa?.replace("mesa-", "") || "1";

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.selectedPrice * item.quantity,
    0
  );

  const sendToWhatsApp = () => {
    const phoneNumber = "5515988240374";
    
    let message = `🍦 *NOVO PEDIDO - MESA ${tableNumber}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} (${item.selectedSize})\n`;
      message += `   R$ ${(item.selectedPrice * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: R$ ${totalPrice.toFixed(2)}*\n`;
    message += `📍 *Mesa: ${tableNumber}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    onClearCart();
    setIsOpen(false);
  };

  if (totalItems === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-float transition-all duration-300",
          "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
          totalItems > 0 ? "animate-bounce-soft" : ""
        )}
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
              {totalItems}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-xs opacity-80">Ver Comanda</div>
          <div className="font-bold">R$ {totalPrice.toFixed(2)}</div>
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
            "absolute bottom-0 left-0 right-0 max-h-[85vh] bg-card rounded-t-3xl shadow-float transition-transform duration-500",
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
              <h2 className="font-display text-xl font-bold text-foreground">
                Sua Comanda
              </h2>
              <p className="text-sm text-muted-foreground">
                Mesa {tableNumber} • {totalItems} {totalItems === 1 ? "item" : "itens"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
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
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="flex gap-4 p-3 bg-muted/50 rounded-xl animate-scale-in"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedSize}
                      </p>
                      <p className="font-bold text-primary mt-1">
                        R$ {(item.selectedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => onRemoveItem(item.id, item.selectedSize)}
                        className="w-8 h-8 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.selectedSize, -1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-card rounded-lg shadow-soft text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.selectedSize, 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-soft hover:opacity-90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
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
                <span className="text-2xl font-display font-bold text-foreground">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={sendToWhatsApp}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:bg-[#20bd5a] active:scale-[0.98] transition-all duration-300 shadow-float"
              >
                <Send className="w-5 h-5" />
                Enviar Pedido via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
