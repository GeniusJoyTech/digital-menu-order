import { useParams } from "react-router-dom";
import { MapPin } from "lucide-react";

const MenuHeader = () => {
  const { mesa } = useParams();
  const isTable = mesa?.startsWith("mesa-");
  const tableNumber = mesa?.replace("mesa-", "") || null;

  return (
    <header className="sticky top-0 z-40 bg-brand-pink py-4">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="font-display text-3xl text-primary-foreground leading-none">
                Shake Yes
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
