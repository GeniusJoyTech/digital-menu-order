import { useState, useEffect } from "react";
import { Phone, MapPin, ShoppingBag, Trash2, Check, X, MessageCircle, Copy, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Order, loadOrders, updateOrderStatus, deleteOrder, deleteOldOrders } from "@/data/ordersConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfDay, endOfDay, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const OrdersManager = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadOrdersData = () => {
      setAllOrders(loadOrders());
    };
    loadOrdersData();
    
    // Reload orders every 10 seconds
    const interval = setInterval(loadOrdersData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders for selected date
  const filteredOrders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return isSameDay(orderDate, selectedDate);
  });

  const handlePrevDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    const tomorrow = addDays(new Date(), 1);
    if (selectedDate < tomorrow) {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isFutureDisabled = selectedDate >= startOfDay(new Date());

  const handleDeleteOldOrders = () => {
    if (confirm("Tem certeza que deseja excluir todos os pedidos com mais de 30 dias?")) {
      const deletedCount = deleteOldOrders(30);
      setAllOrders(loadOrders());
      toast.success(`${deletedCount} pedido(s) antigo(s) excluído(s)!`);
    }
  };

  const handleConfirm = (orderId: string) => {
    updateOrderStatus(orderId, "confirmed");
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
  };

  const handleDelete = (orderId: string) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      deleteOrder(orderId);
      setAllOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const handleCopyOrder = (order: Order) => {
    const itemsText = order.items.map(item => 
      `${item.quantity}x ${item.name} (${item.size}) - R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}`
    ).join("\n");
    
    const extrasText = order.extras.length > 0 
      ? order.extras.map(e => `+ ${e.name} - R$ ${e.price.toFixed(2).replace(".", ",")}`).join("\n")
      : "";
    
    const drinkText = order.drink 
      ? `+ ${order.drink.name} - R$ ${order.drink.price.toFixed(2).replace(".", ",")}`
      : "";

    const deliveryText = order.deliveryType === "table" 
      ? `Mesa: ${order.tableNumber}` 
      : order.deliveryType === "pickup" 
        ? "Retirada na loja" 
        : `Delivery: ${order.address || ""}`;

    const orderText = `*Confirma seu pedido?*

${order.customerName}
${deliveryText}

*Itens:*
${itemsText}
${extrasText}
${drinkText}

*Total: R$ ${order.total.toFixed(2).replace(".", ",")}*`;

    navigator.clipboard.writeText(orderText);
    toast.success("Pedido copiado!");
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("pt-BR", {
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

  // Calculate daily totals
  const dailyTotal = filteredOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = filteredOrders.filter(o => o.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4 text-brand-pink" />
              <span className="font-bold text-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            {!isToday && (
              <button
                onClick={handleToday}
                className="text-xs text-brand-pink hover:underline mt-1"
              >
                Voltar para hoje
              </button>
            )}
          </div>
          
          <button
            onClick={handleNextDay}
            disabled={isFutureDisabled}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isFutureDisabled
                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Pedidos: </span>
              <span className="font-bold text-foreground">{filteredOrders.length}</span>
            </div>
            {pendingCount > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Pendentes: </span>
                <span className="font-bold text-yellow-600">{pendingCount}</span>
              </div>
            )}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-brand-pink">R$ {dailyTotal.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </div>

      {/* Delete Old Orders */}
      <button
        onClick={handleDeleteOldOrders}
        className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Limpar pedidos com mais de 30 dias
      </button>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-foreground text-lg mb-2">Nenhum pedido neste dia</h3>
          <p className="text-muted-foreground text-sm">
            {isToday 
              ? "Os pedidos enviados pelos clientes aparecerão aqui."
              : "Não há pedidos registrados para esta data."}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
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
                <p className="text-sm text-muted-foreground">{formatTime(order.createdAt)} • {getDeliveryLabel(order)}</p>
              </div>
              <p className="font-bold text-brand-pink whitespace-nowrap">
                R$ {order.total.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Phone & Copy */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleWhatsApp(order.customerPhone)}
                className="flex items-center gap-2 text-sm text-brand-pink hover:underline"
              >
                <Phone className="w-4 h-4" />
                {order.customerPhone}
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopyOrder(order)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>

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
        ))
      )}
    </div>
  );
};
