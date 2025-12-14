import { useMenu } from "@/contexts/MenuContext";
import { cn } from "@/lib/utils";

interface ExtrasSectionProps {
  onAddExtra: (name: string, price: number) => void;
}

const ExtrasSection = ({ onAddExtra }: ExtrasSectionProps) => {
  const { config } = useMenu();

  return (
    <section className="mb-8 bg-pastel-yellow rounded-2xl p-4">
      <h3 className="font-display text-2xl text-center text-foreground mb-4">
        Turbine seu Milk Shake
      </h3>
      
      <div className="space-y-2">
        {config.extras.map((extra) => {
          const isOutOfStock = extra.stock === 0;
          return (
            <button
              key={extra.id}
              onClick={() => !isOutOfStock && onAddExtra(extra.name, extra.price)}
              disabled={isOutOfStock}
              className={cn(
                "w-full flex items-center justify-between p-3 bg-card rounded-xl transition-colors",
                isOutOfStock 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-muted"
              )}
            >
              <span className={cn("text-sm text-foreground", isOutOfStock && "line-through")}>
                {extra.name}
                {isOutOfStock && <span className="ml-2 text-xs text-destructive">(Esgotado)</span>}
              </span>
              <span className="font-bold text-brand-pink">
                R${extra.price.toFixed(2).replace(".", ",")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-center text-foreground mb-2">
          Turbine seu açaí por mais R$6,00
        </h4>
        <p className="text-xs text-center text-muted-foreground">
          {config.acaiTurbine
            .filter(item => item.stock !== 0)
            .map(item => item.name)
            .join(", ")}
        </p>
      </div>
    </section>
  );
};

export default ExtrasSection;
