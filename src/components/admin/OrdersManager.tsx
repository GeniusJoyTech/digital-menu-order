import { useState, useEffect } from "react";
import { Phone, MapPin, ShoppingBag, Trash2, Check, X, MessageCircle } from "lucide-react";
import { Order, loadOrders, updateOrderStatus, deleteOrder } from "@/data/ordersConfig";
import { cn } from "@/lib/utils";

export const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrdersData = () => {
      setOrders(loadOrders());
    };
    loadOrdersData();
    
    // Reload orders every 10 seconds
    const interval = setInterval(loadOrdersData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = (orderId: string) => {
    updateOrderStatus(orderId, "confirmed");
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
  };

  const handleDelete = (orderId: string) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      deleteOrder(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "Pendente";
      case "confirmed": return "Confirmado";
      case "cancelled": return "Cancelado";
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-700";
      case "confirmed": return "bg-green-500/20 text-green-700";
      case "cancelled": return "bg-red-500/20 text-red-700";
    }
  };

  const getDeliveryLabel = (order: Order) => {
    switch (order.deliveryType) {
      case "table": return `Mesa ${order.tableNumber}`;
      case "pickup": return "Retirada na loja";
      case "delivery": return "Delivery";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-foreground text-lg mb-2">Nenhum pedido ainda</h3>
        <p className="text-muted-foreground text-sm">
          Os pedidos enviados pelos clientes aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className={cn(
            "p-4 rounded-xl bg-card border border-border space-y-3",
            order.status === "cancelled" && "opacity-50"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground">{order.customerName}</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(order.status))}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)} • {getDeliveryLabel(order)}</p>
            </div>
            <p className="font-bold text-brand-pink whitespace-nowrap">
              R$ {order.total.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {/* Phone */}
          <button
            onClick={() => handleWhatsApp(order.customerPhone)}
            className="flex items-center gap-2 text-sm text-brand-pink hover:underline"
          >
            <Phone className="w-4 h-4" />
            {order.customerPhone}
            <MessageCircle className="w-4 h-4" />
          </button>

          {/* Address */}
          {order.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{order.address}</span>
            </div>
          )}

          {/* Items */}
          <div className="space-y-1 pt-2 border-t border-border">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}x {item.name} ({item.size})
                </span>
                <span className="text-muted-foreground">
                  R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
            {order.extras.map((extra, idx) => (
              <div key={`extra-${idx}`} className="flex justify-between text-sm">
                <span className="text-foreground">+ {extra.name}</span>
                <span className="text-muted-foreground">
                  R$ {extra.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
            {order.drink && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground">+ {order.drink.name}</span>
                <span className="text-muted-foreground">
                  R$ {order.drink.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {order.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleConfirm(order.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
              <button
                onClick={() => handleCancel(order.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          )}

          {order.status !== "pending" && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleDelete(order.id)}
                className="flex items-center gap-1 text-sm text-destructive hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
