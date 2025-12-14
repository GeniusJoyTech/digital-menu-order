import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuItem as MenuItemType } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { useDesign } from "@/contexts/DesignContext";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, size: string, price: number) => void;
  bgColor: string;
}

const MenuItem = ({ item, onAddToCart, bgColor }: MenuItemProps) => {
  const [selectedSize, setSelectedSize] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { design } = useDesign();

  const isOutOfStock = item.stock === 0;
  const layout = design.cardLayout;
  const isRightImage = layout.includes("right");
  const isBordered = layout.includes("bordered");
  const isFilled = layout.includes("filled");

  const handleAdd = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    onAddToCart(
      item,
      item.prices[selectedSize].size,
      item.prices[selectedSize].price
    );
    setTimeout(() => setIsAdding(false), 300);
  };

  const getBgClass = () => {
    if (isBordered) return "bg-card border-2 border-brand-pink/30";
    if (!isFilled) return "bg-card";
    
    switch (bgColor) {
      case "pastel-peach": return "bg-pastel-peach";
      case "pastel-blue": return "bg-pastel-blue";
      case "pastel-lavender": return "bg-pastel-lavender";
      case "pastel-mint": return "bg-pastel-mint";
      case "pastel-yellow": return "bg-pastel-yellow";
      default: return "bg-pastel-pink";
    }
  };

  const ImageSection = () => (
    <div className="relative flex-shrink-0">
      <div className={cn(
        "w-16 h-16 rounded-full overflow-hidden border-3 border-card shadow-md",
        isOutOfStock && "grayscale"
      )}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-destructive text-destructive-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            ESGOTADO
          </span>
        </div>
      )}
    </div>
  );

  const ContentSection = () => (
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-foreground text-sm leading-tight">
        {item.name}
      </h3>
      <p className="text-[10px] text-muted-foreground line-clamp-2 uppercase leading-tight mt-0.5">
        {item.description}
      </p>
      
      {/* Prices in single line */}
      <div className="flex items-center gap-1 text-[10px] mt-1">
        {item.prices.map((price, index) => (
          <button
            key={price.size}
            onClick={() => !isOutOfStock && setSelectedSize(index)}
            disabled={isOutOfStock}
            className={cn(
              "transition-all duration-200",
              selectedSize === index
                ? "text-brand-pink font-bold"
                : "text-foreground",
              isOutOfStock && "cursor-not-allowed"
            )}
          >
            <span className="font-semibold">{price.size}</span>{" "}
            <span className={cn(
              "font-bold",
              selectedSize === index ? "text-brand-pink" : "text-brand-pink"
            )}>
              R${price.price.toFixed(2).replace(".", ",")}
            </span>
            {index < item.prices.length - 1 && (
              <span className="text-muted-foreground mx-1">•</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const AddButton = () => (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={cn(
        "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300",
        isOutOfStock 
          ? "bg-muted text-muted-foreground cursor-not-allowed" 
          : "bg-brand-pink text-primary-foreground hover:opacity-90",
        isAdding && "scale-90"
      )}
    >
      <Plus className="w-4 h-4" />
    </button>
  );

  return (
    <div 
      className={cn(
        "group p-2 rounded-xl transition-all duration-300 animate-fade-in",
        getBgClass(),
        isOutOfStock ? "opacity-60" : "hover:scale-[1.02]"
      )}
    >
      <div className={cn(
        "flex items-center gap-2",
        isRightImage && "flex-row-reverse"
      )}>
        <ImageSection />
        <ContentSection />
        <AddButton />
      </div>
    </div>
  );
};

export default MenuItem;
