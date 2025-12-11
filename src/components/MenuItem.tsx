import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { MenuItem as MenuItemType } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, size: string, price: number) => void;
}

const MenuItem = ({ item, onAddToCart }: MenuItemProps) => {
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

  return (
    <div 
      className={cn(
        "group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-float transition-all duration-500",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {item.popular && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex gap-2 mb-3">
          {item.prices.map((price, index) => (
            <button
              key={price.size}
              onClick={() => setSelectedSize(index)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300",
                selectedSize === index
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <div>{price.size}</div>
              <div className="font-bold">R$ {price.price.toFixed(2)}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300",
            "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
            isAdding && "scale-95 opacity-80"
          )}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
