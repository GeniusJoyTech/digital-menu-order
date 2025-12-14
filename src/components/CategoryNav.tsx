import { useMenu } from "@/contexts/MenuContext";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const { config } = useMenu();

  return (
    <nav className="sticky top-[72px] z-30 bg-background py-3">
      <div className="container">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {config.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm border-2",
                activeCategory === category.id
                  ? "bg-brand-pink text-primary-foreground border-brand-pink"
                  : "bg-card text-foreground border-border hover:border-brand-pink"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
