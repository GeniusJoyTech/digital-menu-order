import { useState, useMemo, useRef, useEffect } from "react";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import CategorySection from "@/components/CategorySection";
import ExtrasSection from "@/components/ExtrasSection";
import Cart from "@/components/Cart";
import { menuItems, menuCategories, MenuItem as MenuItemType, CartItem } from "@/data/menuData";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
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
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedSize === size
      );

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

  const handleAddExtra = (name: string, price: number) => {
    const extraItem: CartItem = {
      id: `extra-${name.toLowerCase().replace(/\s/g, "-")}`,
      name: name,
      description: "",
      prices: [{ size: "Unidade", price }],
      category: "extras",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
      selectedSize: "Unidade",
      selectedPrice: price,
      quantity: 1,
    };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === extraItem.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, extraItem];
    });
  };

  const handleUpdateQuantity = (itemId: string, size: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId && item.selectedSize === size) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
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
            Milk Shakes
          </h1>
          <p className="text-muted-foreground text-sm">
            Aceitamos cartões de crédito e de débito
          </p>
          <p className="text-muted-foreground text-sm">
            Instagram: @milkshake.yes_br
          </p>
        </div>

        {/* Categories */}
        {menuCategories.map((category) => {
          const categoryItems = menuItems.filter((item) => item.category === category.id);
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

        {/* Extras Section */}
        <ExtrasSection onAddExtra={handleAddExtra} />

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Peça também pelo iFood</p>
        </div>
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
