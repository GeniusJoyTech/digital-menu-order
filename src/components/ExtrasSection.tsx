import { useMenu } from "@/contexts/MenuContext";

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
        {config.extras.map((extra) => (
          <button
            key={extra.id}
            onClick={() => onAddExtra(extra.name, extra.price)}
            className="w-full flex items-center justify-between p-3 bg-card rounded-xl hover:bg-muted transition-colors"
          >
            <span className="text-sm text-foreground">{extra.name}</span>
            <span className="font-bold text-brand-pink">
              R${extra.price.toFixed(2).replace(".", ",")}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-center text-foreground mb-2">
          Turbine seu açaí por mais R$6,00
        </h4>
        <p className="text-xs text-center text-muted-foreground">
          {config.acaiTurbine.join(", ")}
        </p>
      </div>
    </section>
  );
};

export default ExtrasSection;
