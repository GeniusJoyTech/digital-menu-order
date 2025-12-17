import { useMenu } from "@/contexts/MenuContext";
import { cn } from "@/lib/utils";
import { isValidHex } from "@/lib/colorUtils";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const { config } = useMenu();

  const getCategoryStyles = (category: { id: string; color: string }, isActive: boolean) => {
    const hasCustomColor = category.color?.startsWith('#') || isValidHex(category.color);
    
    if (isActive) {
      if (hasCustomColor) {
        return {
          style: { backgroundColor: category.color, borderColor: category.color, color: '#fff' },
          className: "px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm border-2 font-nav"
        };
      }
      return {
        style: undefined,
        className: cn(
          "px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm border-2 font-nav",
          `bg-${category.color} border-${category.color} text-foreground`
        )
      };
    } else {
      if (hasCustomColor) {
        return {
          style: { borderColor: category.color, color: category.color },
          className: "px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm border-2 font-nav bg-card hover:opacity-80"
        };
      }
      return {
        style: undefined,
        className: cn(
          "px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm border-2 font-nav bg-card text-foreground",
          `border-${category.color} hover:bg-${category.color}/20`
        )
      };
    }
  };

  return (
    <nav className="sticky top-[72px] z-30 bg-background py-3">
      <div className="container">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {config.categories.map((category) => {
            const isActive = activeCategory === category.id;
            const { style, className } = getCategoryStyles(category, isActive);
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={className}
                style={style}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
