import { useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useDesign } from "@/contexts/DesignContext";

const MenuHeader = () => {
  const { mesa } = useParams();
  const { design } = useDesign();
  const isTable = mesa?.startsWith("mesa-");
  const tableNumber = mesa?.replace("mesa-", "") || null;

  return (
    <header className="sticky top-0 z-40 bg-brand-pink py-4">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {design.logo && (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-foreground/30 shadow-md flex-shrink-0">
                <img
                  src={design.logo}
                  alt={design.storeName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="font-display text-3xl text-primary-foreground leading-none">
                {design.storeName}
              </h1>
              <p className="text-xs text-primary-foreground/80">
                Personalizamos o copo com o seu nome!
              </p>
            </div>
          </div>
          {isTable && tableNumber && (
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-3 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Mesa {tableNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;
