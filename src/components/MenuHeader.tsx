import { useParams } from "react-router-dom";
import { MapPin } from "lucide-react";

const MenuHeader = () => {
  const { mesa } = useParams();
  const tableNumber = mesa?.replace("mesa-", "") || "1";

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center shadow-soft">
              <span className="text-2xl">🍦</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Shake & Açaí
              </h1>
              <p className="text-sm text-muted-foreground">Cardápio Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Mesa {tableNumber}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;
