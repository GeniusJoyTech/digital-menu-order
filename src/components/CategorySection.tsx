import { MenuItem as MenuItemType } from "@/data/menuData";
import MenuItem from "./MenuItem";

interface CategorySectionProps {
  id: string;
  name: string;
  color: string;
  items: MenuItemType[];
  onAddToCart: (item: MenuItemType, size: string, price: number) => void;
}

const CategorySection = ({ id, name, color, items, onAddToCart }: CategorySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section id={id} className="mb-8">
      <h2 className="font-display text-3xl text-center text-foreground mb-6">
        {name}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            bgColor={color}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
