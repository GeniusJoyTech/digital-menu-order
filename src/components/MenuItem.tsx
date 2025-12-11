import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuItem as MenuItemType } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, size: string, price: number) => void;
  bgColor: string;
}

const MenuItem = ({ item, onAddToCart, bgColor }: MenuItemProps) => {
  const [selectedSize, setSelectedSize] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(
      item,
      item.prices[selectedSize].size,
      item.prices[selectedSize].price
    );
    setTimeout(() => setIsAdding(false), 300);
  };

  const getBgClass = () => {
    switch (bgColor) {
      case "pastel-peach": return "bg-pastel-peach";
      case "pastel-blue": return "bg-pastel-blue";
      case "pastel-lavender": return "bg-pastel-lavender";
      case "pastel-mint": return "bg-pastel-mint";
      case "pastel-yellow": return "bg-pastel-yellow";
      default: return "bg-pastel-pink";
    }
  };

  return (
    <div 
      className={cn(
        "group p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in",
        getBgClass()
      )}
    >
      <div className="flex gap-3">
        {/* Circular Image */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-card shadow-md">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm leading-tight mb-1">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 uppercase">
            {item.description}
          </p>
          
          {/* Prices */}
          <div className="flex flex-wrap gap-1 text-xs">
            {item.prices.map((price, index) => (
              <button
                key={price.size}
                onClick={() => setSelectedSize(index)}
                className={cn(
                  "transition-all duration-200",
                  selectedSize === index
                    ? "text-brand-pink font-bold"
                    : "text-foreground"
                )}
              >
                <span className="font-semibold">{price.size}</span>{" "}
                <span className={cn(
                  "font-bold",
                  selectedSize === index ? "text-brand-pink" : "text-primary"
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

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className={cn(
            "self-center w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
            "bg-brand-pink text-primary-foreground hover:opacity-90",
            isAdding && "scale-90"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
