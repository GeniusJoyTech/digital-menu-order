import { useState, useRef } from "react";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import CategorySection from "@/components/CategorySection";
import Cart from "@/components/Cart";
import { MenuItem as MenuItemType, CartItem } from "@/data/menuData";
import { useMenu } from "@/contexts/MenuContext";
import { useDesign } from "@/contexts/DesignContext";

const Index = () => {
  const { config } = useMenu();
  const { design } = useDesign();
  const [activeCategory, setActiveCategory] = useState(config.categories[0]?.id || "tradicionais");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const section = sectionRefs.current[categoryId];
    if (section) {
      const yOffset = -140;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleAddToCart = (item: MenuItemType, size: string, price: number) => {
    // Check stock limit
    const menuItem = config.menuItems.find(m => m.id === item.id);
    const maxQuantity = menuItem?.stock;
    
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedSize === size
      );

      // Calculate total quantity of this item in cart (all sizes)
      const totalInCart = prev
        .filter(cartItem => cartItem.id === item.id)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      // If stock is defined and adding would exceed it, don't add
      if (maxQuantity !== undefined && totalInCart >= maxQuantity) {
        return prev;
      }

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prev,
        {
          ...item,
          selectedSize: size,
          selectedPrice: price,
          quantity: 1,
        },
      ];
    });
  };


  const handleUpdateQuantity = (itemId: string, size: string, delta: number) => {
    setCartItems((prev) => {
      // Find the menu item to check stock
      const menuItem = config.menuItems.find(m => m.id === itemId);
      const maxQuantity = menuItem?.stock;

      return prev
        .map((item) => {
          if (item.id === itemId && item.selectedSize === size) {
            const newQuantity = item.quantity + delta;
            
            // Don't allow going below 1 (will be removed)
            if (newQuantity <= 0) return null;
            
            // Check stock limit when increasing
            if (delta > 0 && maxQuantity !== undefined) {
              const totalInCart = prev
                .filter(cartItem => cartItem.id === itemId)
                .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
              
              if (totalInCart >= maxQuantity) {
                return item; // Don't increase
              }
            }
            
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === itemId && item.selectedSize === size))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <MenuHeader />
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="container py-6">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
            {design.storeName}
          </h1>
          {design.socialLinks && design.socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-1">
              {design.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-foreground underline"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        {config.categories.map((category) => {
          const categoryItems = config.menuItems.filter((item) => item.category === category.id);
          return (
            <div
              key={category.id}
              ref={(el) => (sectionRefs.current[category.id] = el)}
            >
              <CategorySection
                id={category.id}
                name={category.name}
                color={category.color}
                items={categoryItems}
                onAddToCart={handleAddToCart}
              />
            </div>
          );
        })}

        {/* Extras Section removed - managed via checkout steps */}

        {/* Footer - Social Links */}
        {design.socialLinks && design.socialLinks.length > 0 && (
          <div className="text-center mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Siga-nos nas redes sociais</p>
            <div className="flex items-center justify-center gap-4">
              {design.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-brand-pink transition-colors underline"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <Cart
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
};

export default Index;
