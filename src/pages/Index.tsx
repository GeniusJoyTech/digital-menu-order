import { useState, useMemo } from "react";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItem from "@/components/MenuItem";
import Cart from "@/components/Cart";
import { menuItems, menuCategories, MenuItem as MenuItemType, CartItem } from "@/data/menuData";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

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

  const currentCategory = menuCategories.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-32">
      <MenuHeader />
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container py-6">
        <div className="mb-6 animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <span>{currentCategory?.icon}</span>
            {currentCategory?.name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Escolha seus favoritos e adicione à comanda
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
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
