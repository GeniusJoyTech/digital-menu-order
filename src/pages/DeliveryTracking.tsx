import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Package, Truck, MapPin, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { getDelivery, updateDeliveryStatus, DeliveryTracking as DeliveryTrackingType } from "@/data/deliveryConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DeliveryTrackingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isDriver = searchParams.get("driver") === "true";
  
  const [delivery, setDelivery] = useState<DeliveryTrackingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDelivery = () => {
    if (id) {
      const data = getDelivery(id);
      setDelivery(data);
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDelivery();
    
    // Auto-refresh every 10 seconds for customer view
    if (!isDriver) {
      const interval = setInterval(loadDelivery, 10000);
      return () => clearInterval(interval);
    }
  }, [id, isDriver]);

  const handleStatusUpdate = (status: DeliveryTrackingType["status"]) => {
    if (!id) return;
    
    const updated = updateDeliveryStatus(id, status);
    if (updated) {
      setDelivery(updated);
      
      const statusMessages = {
        preparing: "Status: Preparando pedido",
        on_the_way: "Status: A caminho!",
        arriving: "Status: Chegando!",
        delivered: "Entrega finalizada!",
      };
      
      toast.success(statusMessages[status]);
    }
  };

  const getStatusInfo = (status: DeliveryTrackingType["status"]) => {
    switch (status) {
      case "preparing":
        return { label: "Preparando", icon: Package, color: "text-orange-500", bg: "bg-orange-500" };
      case "on_the_way":
        return { label: "A caminho", icon: Truck, color: "text-blue-500", bg: "bg-blue-500" };
      case "arriving":
        return { label: "Chegando", icon: MapPin, color: "text-purple-500", bg: "bg-purple-500" };
      case "delivered":
        return { label: "Entregue", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500" };
    }
  };

  const statuses: DeliveryTrackingType["status"][] = ["preparing", "on_the_way", "arriving", "delivered"];
  const currentIndex = delivery ? statuses.indexOf(delivery.status) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-brand-pink" />
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Entrega não encontrada</h1>
          <p className="text-muted-foreground">Este link de rastreamento não é válido ou expirou.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(delivery.status);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-6">
          <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4", statusInfo.bg)}>
            <statusInfo.icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isDriver ? "Painel do Entregador" : "Acompanhe sua entrega"}
          </h1>
          <p className="text-muted-foreground">
            Pedido de {delivery.customerName}
          </p>
        </div>

        {/* Status Progress */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="space-y-4">
            {statuses.map((status, index) => {
              const info = getStatusInfo(status);
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive ? info.bg : "bg-muted",
                    isCurrent && "ring-4 ring-offset-2 ring-offset-background",
                    isCurrent && `ring-${info.bg.replace("bg-", "")}/30`
                  )}>
                    <info.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {info.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground">
                        Atualizado às {new Date(delivery.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  {isActive && index < currentIndex && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Controls */}
        {isDriver && delivery.status !== "delivered" && (
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-center">Atualizar Status</h2>
            
            {delivery.status === "preparing" && (
              <button
                onClick={() => handleStatusUpdate("on_the_way")}
                className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                Saí para entrega
              </button>
            )}
            
            {delivery.status === "on_the_way" && (
              <button
                onClick={() => handleStatusUpdate("arriving")}
                className="w-full py-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Estou chegando
              </button>
            )}
            
            {(delivery.status === "on_the_way" || delivery.status === "arriving") && (
              <button
                onClick={() => handleStatusUpdate("delivered")}
                className="w-full py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Finalizar Entrega
              </button>
            )}
          </div>
        )}

        {/* Delivered Message */}
        {delivery.status === "delivered" && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <h2 className="font-bold text-green-700 text-lg">Pedido Entregue!</h2>
            <p className="text-sm text-green-600">
              {isDriver ? "Obrigado pela entrega!" : "Obrigado pela preferência!"}
            </p>
          </div>
        )}

        {/* Customer Refresh */}
        {!isDriver && delivery.status !== "delivered" && (
          <div className="text-center space-y-2">
            <button
              onClick={loadDelivery}
              className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar status
            </button>
            <p className="text-xs text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            ID: {delivery.id.substring(0, 12)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingPage;
