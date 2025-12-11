import { menuCategories } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md py-3 border-b border-border">
      <div className="container">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
