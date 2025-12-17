import { useState, useEffect, useCallback } from "react";
import { Phone, MapPin, ShoppingBag, Trash2, Check, X, MessageCircle, Copy, ChevronLeft, ChevronRight, Calendar, Download, ChefHat, Truck, PackageCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfDay, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { restoreOrderStock } from "@/services/supabaseStockService";
import { useSupabaseOrders, Order, OrderItem, OrderExtra } from "@/hooks/useSupabaseOrders";

export const OrdersManager = () => {
  const { orders: allOrders, loading, reload, updateOrderStatus, deleteOrder, deleteOldOrders } = useSupabaseOrders();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    reload();
    // Reload orders every 30 seconds
    const interval = setInterval(() => reload(), 30000);
    return () => clearInterval(interval);
  }, [reload]);

  // Filter orders for selected date
  const filteredOrders = allOrders.filter(order => {
    const orderDate = new Date(order.created_at);
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

  const handleDeleteOldOrders = async () => {
    if (confirm("Tem certeza que deseja excluir todos os pedidos com mais de 30 dias?")) {
      const { count } = await deleteOldOrders(30);
      toast.success(`${count || 0} pedido(s) antigo(s) excluído(s)!`);
    }
  };

  const handleDownloadPDF = () => {
    const ordersByDate: { [key: string]: Order[] } = {};
    
    allOrders.forEach(order => {
      const dateKey = format(new Date(order.created_at), "yyyy-MM-dd");
      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = [];
      }
      ordersByDate[dateKey].push(order);
    });

    const sortedDates = Object.keys(ordersByDate).sort((a, b) => b.localeCompare(a));

    if (sortedDates.length === 0) {
      toast.error("Não há pedidos para exportar");
      return;
    }

    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = 280;
    const lineHeight = 6;
    const marginLeft = 15;

    doc.setFontSize(18);
    doc.text("Relatório de Pedidos", marginLeft, yPosition);
    yPosition += 15;

    sortedDates.forEach((dateKey) => {
      const orders = ordersByDate[dateKey];
      const dateFormatted = format(new Date(dateKey), "dd/MM/yyyy - EEEE", { locale: ptBR });
      
      const dailyTotal = orders
        .filter(o => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0);

      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(marginLeft - 2, yPosition - 5, 180, 10, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(dateFormatted, marginLeft, yPosition);
      doc.text(`Total: R$ ${dailyTotal.toFixed(2).replace(".", ",")}`, 150, yPosition);
      yPosition += 12;

      orders.forEach((order) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        
        const time = format(new Date(order.created_at), "HH:mm");
        const statusText = order.status === "confirmed" ? "[CONFIRMADO]" : 
                          order.status === "cancelled" ? "[CANCELADO]" : "[PENDENTE]";
        
        doc.text(`${time} - ${order.customer_name} ${statusText}`, marginLeft, yPosition);
        doc.text(`R$ ${order.total.toFixed(2).replace(".", ",")}`, 170, yPosition);
        yPosition += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        const deliveryText = order.delivery_type === "table" 
          ? `Mesa ${order.table_number}` 
          : order.delivery_type === "pickup" 
            ? "Retirada na loja" 
            : `Delivery${order.observations ? `: ${order.observations.substring(0, 50)}` : ""}`;
        doc.text(`${order.customer_phone} • ${deliveryText}`, marginLeft + 5, yPosition);
        yPosition += lineHeight;

        order.items.forEach(item => {
          if (yPosition > pageHeight - 10) {
            doc.addPage();
            yPosition = 20;
          }
          const size = (item as any).size || "";
          doc.text(`  ${item.quantity}x ${item.name}${size ? ` (${size})` : ""}`, marginLeft + 5, yPosition);
          yPosition += lineHeight - 1;
        });

        order.extras.forEach(extra => {
          if (yPosition > pageHeight - 10) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`  + ${extra.name}`, marginLeft + 5, yPosition);
          yPosition += lineHeight - 1;
        });

        if (order.drink) {
          if (yPosition > pageHeight - 10) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`  + ${order.drink}`, marginLeft + 5, yPosition);
          yPosition += lineHeight - 1;
        }

        yPosition += 4;
      });

      yPosition += 8;
    });

    const grandTotal = allOrders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL GERAL: R$ ${grandTotal.toFixed(2).replace(".", ",")}`, marginLeft, yPosition);

    const fileName = `pedidos_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;
    doc.save(fileName);
    toast.success("PDF gerado com sucesso!");
  };

  const handleDownloadDayPDF = () => {
    if (filteredOrders.length === 0) {
      toast.error("Não há pedidos neste dia para exportar");
      return;
    }

    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 6;
    const marginLeft = 15;
    const pageHeight = 280;

    const dateFormatted = format(selectedDate, "dd/MM/yyyy - EEEE", { locale: ptBR });
    
    const dailyTotal = filteredOrders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Pedidos - ${dateFormatted}`, marginLeft, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Total do dia: R$ ${dailyTotal.toFixed(2).replace(".", ",")}`, marginLeft, yPosition);
    doc.text(`${filteredOrders.length} pedido(s)`, 120, yPosition);
    yPosition += 15;

    filteredOrders.forEach((order) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      
      const time = format(new Date(order.created_at), "HH:mm");
      const statusText = order.status === "confirmed" ? "[CONFIRMADO]" : 
                        order.status === "cancelled" ? "[CANCELADO]" : "[PENDENTE]";
      
      doc.text(`${time} - ${order.customer_name} ${statusText}`, marginLeft, yPosition);
      doc.text(`R$ ${order.total.toFixed(2).replace(".", ",")}`, 170, yPosition);
      yPosition += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      const deliveryText = order.delivery_type === "table" 
        ? `Mesa ${order.table_number}` 
        : order.delivery_type === "pickup" 
          ? "Retirada na loja" 
          : `Delivery${order.observations ? `: ${order.observations.substring(0, 50)}` : ""}`;
      doc.text(`${order.customer_phone} • ${deliveryText}`, marginLeft + 5, yPosition);
      yPosition += lineHeight;

      order.items.forEach(item => {
        if (yPosition > pageHeight - 10) {
          doc.addPage();
          yPosition = 20;
        }
        const size = (item as any).size || "";
        doc.text(`  ${item.quantity}x ${item.name}${size ? ` (${size})` : ""}`, marginLeft + 5, yPosition);
        yPosition += lineHeight - 1;
      });

      order.extras.forEach(extra => {
        if (yPosition > pageHeight - 10) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`  + ${extra.name}`, marginLeft + 5, yPosition);
        yPosition += lineHeight - 1;
      });

      if (order.drink) {
        if (yPosition > pageHeight - 10) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`  + ${order.drink}`, marginLeft + 5, yPosition);
        yPosition += lineHeight - 1;
      }

      yPosition += 6;
    });

    const fileName = `pedidos_${format(selectedDate, "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
    toast.success("PDF do dia gerado com sucesso!");
  };

  const handleConfirm = async (orderId: string) => {
    await updateOrderStatus(orderId, "confirmed");
    toast.success("Pedido confirmado!");
  };

  const handleCancel = async (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (order && order.status !== "cancelled") {
      // Restore stock when cancelling
      const itemsForStock = order.items.map(i => ({
        id: (i as any).id || "",
        quantity: i.quantity
      })).filter(i => i.id);
      
      const extrasForStock = order.extras.map(e => ({
        id: (e as any).id || "",
        quantity: e.quantity || 1
      })).filter(e => e.id);
      
      await restoreOrderStock(itemsForStock, extrasForStock);
    }
    await updateOrderStatus(orderId, "cancelled");
    toast.success("Pedido cancelado e estoque restaurado!");
  };

  const handleDelete = async (orderId: string) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      await deleteOrder(orderId);
      toast.success("Pedido excluído!");
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const sendStatusMessage = (order: Order, status: "kitchen" | "left" | "delivered") => {
    const cleanPhone = order.customer_phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    
    const messages = {
      kitchen: `Olá ${order.customer_name}! 👨‍🍳\n\nSeu pedido já está sendo preparado na cozinha!\n\nEm breve ficará pronto. Obrigado pela preferência! 🍹`,
      left: `Olá ${order.customer_name}! 🛵\n\nSeu pedido acabou de sair para entrega!\n\nEm breve chegará até você. Obrigado! 📦`,
      delivered: `Olá ${order.customer_name}! ✅\n\nSeu pedido foi entregue!\n\nEsperamos que goste! Obrigado pela preferência! 💜`
    };

    const message = encodeURIComponent(messages[status]);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
    toast.success("WhatsApp aberto com a mensagem!");
  };

  const handleCopyOrder = (order: Order) => {
    const itemsText = order.items.map(item => {
      const size = (item as any).size || "";
      return `${item.quantity}x ${item.name}${size ? ` (${size})` : ""} - R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}`;
    }).join("\n");
    
    const extrasText = order.extras.length > 0 
      ? order.extras.map(e => `+ ${e.name} - R$ ${e.price.toFixed(2).replace(".", ",")}`).join("\n")
      : "";
    
    const drinkText = order.drink ? `+ ${order.drink}` : "";

    const deliveryText = order.delivery_type === "table" 
      ? `Mesa: ${order.table_number}` 
      : order.delivery_type === "pickup" 
        ? "Retirada na loja" 
        : `Delivery: ${order.observations || ""}`;

    const orderText = `*Confirma seu pedido?*

${order.customer_name}
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
    switch (order.delivery_type) {
      case "table": return `Mesa ${order.table_number}`;
      case "pickup": return "Retirada na loja";
      case "delivery": return "Delivery";
      default: return "";
    }
  };

  // Calculate daily totals
  const dailyTotal = filteredOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = filteredOrders.filter(o => o.status === "pending").length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => {
            reload();
            toast.success("Pedidos atualizados!");
          }}
          className="w-full py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Atualizar
        </button>
        <button
          onClick={handleDownloadDayPDF}
          className="w-full py-2 rounded-lg bg-brand-pink/10 text-brand-pink text-sm font-medium hover:bg-brand-pink/20 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          PDF do dia
        </button>
        <button
          onClick={handleDownloadPDF}
          className="w-full py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          PDF completo
        </button>
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
                  <h3 className="font-bold text-foreground">{order.customer_name}</h3>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{formatTime(order.created_at)} • {getDeliveryLabel(order)}</p>
              </div>
              <p className="font-bold text-brand-pink whitespace-nowrap">
                R$ {order.total.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Phone & Copy */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleWhatsApp(order.customer_phone)}
                className="flex items-center gap-2 text-sm text-brand-pink hover:underline"
              >
                <Phone className="w-4 h-4" />
                {order.customer_phone}
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
            {order.observations && order.delivery_type === "delivery" && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{order.observations}</span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-1 pt-2 border-t border-border">
              {order.items.map((item, idx) => {
                const size = (item as any).size || "";
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.quantity}x {item.name}{size ? ` (${size})` : ""}
                    </span>
                    <span className="text-muted-foreground">
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                );
              })}
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
                  <span className="text-foreground">+ {order.drink}</span>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {order.status === "confirmed" && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => sendStatusMessage(order, "kitchen")}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-orange-500/10 text-orange-600 text-xs font-medium hover:bg-orange-500/20 transition-colors"
                >
                  <ChefHat className="w-3 h-3" />
                  Na cozinha
                </button>
                <button
                  onClick={() => sendStatusMessage(order, "left")}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                >
                  <Truck className="w-3 h-3" />
                  Saiu
                </button>
                <button
                  onClick={() => sendStatusMessage(order, "delivered")}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-500/20 transition-colors"
                >
                  <PackageCheck className="w-3 h-3" />
                  Entregue
                </button>
              </div>
            )}

            {/* Actions */}
            {order.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleConfirm(order.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Concluído
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
