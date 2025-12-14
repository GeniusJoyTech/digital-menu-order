import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/contexts/MenuContext";
import { useDesign, CardLayout } from "@/contexts/DesignContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Trash2, Edit2, Save, X, RotateCcw, Upload, Image, Package, Minus, Palette, Settings, List, Layers } from "lucide-react";
import { MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { CheckoutStepsManager } from "@/components/admin/CheckoutStepsManager";

const FONT_OPTIONS = [
  { value: "Pacifico", label: "Pacifico (Cursiva)" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Inter", label: "Inter" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
];

const LAYOUT_OPTIONS: { value: CardLayout; label: string; description: string }[] = [
  { value: "left-filled", label: "Imagem à esquerda (Preenchido)", description: "Card com fundo colorido e imagem à esquerda" },
  { value: "right-filled", label: "Imagem à direita (Preenchido)", description: "Card com fundo colorido e imagem à direita" },
  { value: "left-bordered", label: "Imagem à esquerda (Bordas)", description: "Card com borda e imagem à esquerda" },
  { value: "right-bordered", label: "Imagem à direita (Bordas)", description: "Card com borda e imagem à direita" },
  { value: "left", label: "Imagem à esquerda (Simples)", description: "Card simples com imagem à esquerda" },
  { value: "right", label: "Imagem à direita (Simples)", description: "Card simples com imagem à direita" },
];

type TabType = "items" | "categories" | "extras" | "drinks" | "acai" | "checkout" | "stock" | "design";

const Admin = () => {
  const { isAuthenticated, logout } = useAuth();
  const { config, updateMenuItem, addMenuItem, deleteMenuItem, updateExtra, addExtra, deleteExtra, updateDrinkOption, addDrinkOption, deleteDrinkOption, addAcaiTurbineItem, removeAcaiTurbineItem, updateAcaiTurbineItem, updateCategories, resetToDefault } = useMenu();
  const { design, updateDesign, resetDesign } = useDesign();
  const { config: checkoutConfig, updateStep, addStep, deleteStep, reorderSteps, resetToDefault: resetCheckout } = useCheckout();
  
  const [activeTab, setActiveTab] = useState<TabType>("items");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingExtra, setEditingExtra] = useState<{ id: string; name: string; price: number } | null>(null);
  const [editingDrink, setEditingDrink] = useState<{ id: string; name: string; price: number } | null>(null);
  const [newAcaiItem, setNewAcaiItem] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveItem = (item: MenuItem) => {
    if (editingItem) {
      updateMenuItem(item);
      toast.success("Item atualizado!");
    } else {
      addMenuItem(item);
      toast.success("Item adicionado!");
    }
    setEditingItem(null);
    setShowAddItem(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteMenuItem(id);
      toast.success("Item removido!");
    }
  };

  const handleSaveExtra = (extra: { id: string; name: string; price: number }) => {
    if (editingExtra) {
      updateExtra(extra);
      toast.success("Extra atualizado!");
    } else {
      addExtra(extra);
      toast.success("Extra adicionado!");
    }
    setEditingExtra(null);
    setShowAddExtra(false);
  };

  const handleDeleteExtra = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este extra?")) {
      deleteExtra(id);
      toast.success("Extra removido!");
    }
  };

  const handleSaveDrink = (drink: { id: string; name: string; price: number }) => {
    if (editingDrink) {
      updateDrinkOption(drink);
      toast.success("Bebida atualizada!");
    } else {
      addDrinkOption(drink);
      toast.success("Bebida adicionada!");
    }
    setEditingDrink(null);
    setShowAddDrink(false);
  };

  const handleDeleteDrink = (id: string) => {
    if (id === "none") {
      toast.error("Não é possível remover a opção 'Não, obrigado'");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta bebida?")) {
      deleteDrinkOption(id);
      toast.success("Bebida removida!");
    }
  };

  const handleAddAcaiItem = () => {
    if (newAcaiItem.trim()) {
      addAcaiTurbineItem({ name: newAcaiItem.trim() });
      setNewAcaiItem("");
      toast.success("Item adicionado!");
    }
  };

  const handleRemoveAcaiItem = (index: number) => {
    removeAcaiTurbineItem(index);
    toast.success("Item removido!");
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja restaurar todas as configurações padrão? Isso irá apagar todas as alterações.")) {
      resetToDefault();
      resetCheckout();
      toast.success("Configurações restauradas!");
    }
  };

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "items", label: "Itens do Cardápio" },
    { id: "categories", label: "Categorias", icon: <Layers className="w-4 h-4" /> },
    { id: "extras", label: "Turbinar Shake" },
    { id: "drinks", label: "Água/Refrigerante" },
    { id: "acai", label: "Turbinar Açaí" },
    { id: "checkout", label: "Etapas do Pedido", icon: <List className="w-4 h-4" /> },
    { id: "stock", label: "Estoque" },
    { id: "design", label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl text-brand-pink">Administração</h1>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-brand-pink text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === "items" && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddItem(true);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              Adicionar Item
            </button>

            {config.categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <h2 className="font-display text-xl text-brand-pink">{category.name}</h2>
                {config.menuItems
                  .filter((item) => item.category === category.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                        item.stock === 0 && "opacity-50"
                      )}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                          {item.stock === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">Esgotado</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.prices.map((p) => `${p.size} R$${p.price.toFixed(2)}`).join(" • ")}
                          {item.stock !== undefined && item.stock > 0 && ` • Estoque: ${item.stock}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "categories" && (
          <CategoryManager
            categories={config.categories}
            menuItems={config.menuItems}
            onUpdate={updateCategories}
          />
        )}

        {activeTab === "extras" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Gerencie os itens extras para turbinar o shake. Adicione, edite nome e preço, ou remova opções.
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingExtra(null);
                setShowAddExtra(true);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              Adicionar Extra
            </button>

            {config.extras.map((extra) => (
              <div
                key={extra.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl bg-card border border-border",
                  extra.stock === 0 && "opacity-50"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{extra.name}</h3>
                    {extra.stock === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">Esgotado</span>
                    )}
                  </div>
                  <p className="text-brand-pink font-bold">
                    R$ {extra.price.toFixed(2).replace(".", ",")}
                    {extra.stock !== undefined && extra.stock > 0 && (
                      <span className="text-muted-foreground text-xs font-normal ml-2">Estoque: {extra.stock}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingExtra(extra)}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExtra(extra.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "drinks" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Gerencie as opções de bebidas extras (água e refrigerante). Adicione, edite ou remova opções.
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingDrink(null);
                setShowAddDrink(true);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              Adicionar Bebida
            </button>

            {config.drinkOptions.map((drink) => (
              <div
                key={drink.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl bg-card border border-border",
                  drink.stock === 0 && drink.id !== "none" && "opacity-50"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{drink.name}</h3>
                    {drink.stock === 0 && drink.id !== "none" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">Esgotado</span>
                    )}
                  </div>
                  {drink.price > 0 && (
                    <p className="text-brand-pink font-bold">
                      R$ {drink.price.toFixed(2).replace(".", ",")}
                      {drink.stock !== undefined && drink.stock > 0 && (
                        <span className="text-muted-foreground text-xs font-normal ml-2">Estoque: {drink.stock}</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDrink(drink)}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDrink(drink.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "acai" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAcaiItem}
                onChange={(e) => setNewAcaiItem(e.target.value)}
                placeholder="Nome do item..."
                className="flex-1 p-3 rounded-xl border border-border bg-card text-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleAddAcaiItem()}
              />
              <button
                onClick={handleAddAcaiItem}
                className="px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {config.acaiTurbine.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <span className="flex-1 font-medium text-foreground">{item.name}</span>
                <button
                  onClick={() => handleRemoveAcaiItem(index)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "checkout" && (
          <CheckoutStepsManager
            steps={checkoutConfig.steps}
            menuItems={config.menuItems}
            onUpdate={updateStep}
            onAdd={addStep}
            onDelete={deleteStep}
            onReorder={reorderSteps}
          />
        )}

        {activeTab === "stock" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-pink" />
                  <h3 className="font-bold text-foreground">Controle de Estoque</h3>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Restaurar estoque de todos os itens para ilimitado?")) {
                      config.menuItems.forEach(item => {
                        updateMenuItem({ ...item, stock: undefined });
                      });
                      config.extras.forEach(extra => {
                        updateExtra({ ...extra, stock: undefined });
                      });
                      config.drinkOptions.forEach(drink => {
                        if (drink.id !== "none") {
                          updateDrinkOption({ ...drink, stock: undefined });
                        }
                      });
                      config.acaiTurbine.forEach((item, index) => {
                        updateAcaiTurbineItem(index, { ...item, stock: undefined });
                      });
                      toast.success("Estoque restaurado para ilimitado!");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Estoque
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajuste a quantidade em estoque de cada produto. Itens com estoque 0 ficam marcados como "Esgotado". 
                Deixe vazio para estoque ilimitado.
              </p>
            </div>

            {/* Menu Items Stock */}
            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-pink">Produtos do Cardápio</h2>
              {config.categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h3 className="font-bold text-foreground text-sm">{category.name}</h3>
                  {config.menuItems
                    .filter((item) => item.category === category.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                          item.stock === 0 && "border-destructive/50 bg-destructive/5"
                        )}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                          {item.stock === 0 && (
                            <span className="text-xs text-destructive font-medium">Esgotado</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentStock = item.stock ?? 0;
                              if (currentStock > 0) {
                                updateMenuItem({ ...item, stock: currentStock - 1 });
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.stock ?? ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : parseInt(e.target.value) || 0;
                              updateMenuItem({ ...item, stock: value });
                            }}
                            placeholder="∞"
                            className="w-16 p-2 text-center rounded-lg border border-border bg-background text-foreground font-bold"
                            min="0"
                          />
                          <button
                            onClick={() => {
                              const currentStock = item.stock ?? 0;
                              updateMenuItem({ ...item, stock: currentStock + 1 });
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Extras Stock */}
            <div className="space-y-2">
              <h2 className="font-display text-xl text-brand-pink">Turbinar Shake</h2>
              {config.extras.map((extra) => (
                <div
                  key={extra.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                    extra.stock === 0 && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{extra.name}</h3>
                    {extra.stock === 0 && (
                      <span className="text-xs text-destructive font-medium">Esgotado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentStock = extra.stock ?? 0;
                        if (currentStock > 0) {
                          updateExtra({ ...extra, stock: currentStock - 1 });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={extra.stock ?? ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value) || 0;
                        updateExtra({ ...extra, stock: value });
                      }}
                      placeholder="∞"
                      className="w-16 p-2 text-center rounded-lg border border-border bg-background text-foreground font-bold"
                      min="0"
                    />
                    <button
                      onClick={() => {
                        const currentStock = extra.stock ?? 0;
                        updateExtra({ ...extra, stock: currentStock + 1 });
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drinks Stock */}
            <div className="space-y-2">
              <h2 className="font-display text-xl text-brand-pink">Água/Refrigerante</h2>
              {config.drinkOptions.filter(d => d.id !== "none").map((drink) => (
                <div
                  key={drink.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                    drink.stock === 0 && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{drink.name}</h3>
                    {drink.stock === 0 && (
                      <span className="text-xs text-destructive font-medium">Esgotado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentStock = drink.stock ?? 0;
                        if (currentStock > 0) {
                          updateDrinkOption({ ...drink, stock: currentStock - 1 });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={drink.stock ?? ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value) || 0;
                        updateDrinkOption({ ...drink, stock: value });
                      }}
                      placeholder="∞"
                      className="w-16 p-2 text-center rounded-lg border border-border bg-background text-foreground font-bold"
                      min="0"
                    />
                    <button
                      onClick={() => {
                        const currentStock = drink.stock ?? 0;
                        updateDrinkOption({ ...drink, stock: currentStock + 1 });
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Açaí Turbine Stock */}
            <div className="space-y-2">
              <h2 className="font-display text-xl text-brand-pink">Turbinar Açaí</h2>
              {config.acaiTurbine.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                    item.stock === 0 && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                    {item.stock === 0 && (
                      <span className="text-xs text-destructive font-medium">Esgotado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentStock = item.stock ?? 0;
                        if (currentStock > 0) {
                          updateAcaiTurbineItem(index, { ...item, stock: currentStock - 1 });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={item.stock ?? ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value) || 0;
                        updateAcaiTurbineItem(index, { ...item, stock: value });
                      }}
                      placeholder="∞"
                      className="w-16 p-2 text-center rounded-lg border border-border bg-background text-foreground font-bold"
                      min="0"
                    />
                    <button
                      onClick={() => {
                        const currentStock = item.stock ?? 0;
                        updateAcaiTurbineItem(index, { ...item, stock: currentStock + 1 });
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "design" && (
          <div className="space-y-6">
            {/* Logo Section */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-brand-pink" />
                <h3 className="font-bold text-foreground">Logo da Loja</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                  {design.logo ? (
                    <img src={design.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Imagem muito grande. Máximo 2MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateDesign({ logo: reader.result as string });
                          toast.success("Logo atualizada!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </button>
                  {design.logo && (
                    <button
                      onClick={() => {
                        updateDesign({ logo: "" });
                        toast.success("Logo removida!");
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover Logo
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Nome da Loja</label>
                <input
                  type="text"
                  value={design.storeName}
                  onChange={(e) => updateDesign({ storeName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
                />
              </div>
            </div>

            {/* Colors Section */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-brand-pink" />
                <h3 className="font-bold text-foreground">Cores</h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorPicker
                  label="Cor Principal"
                  hslValue={design.primaryColor}
                  onChange={(value) => updateDesign({ primaryColor: value })}
                />
                
                <ColorPicker
                  label="Cor de Fundo"
                  hslValue={design.backgroundColor}
                  onChange={(value) => updateDesign({ backgroundColor: value })}
                />
                
                <ColorPicker
                  label="Cor do Card"
                  hslValue={design.cardBackground}
                  onChange={(value) => updateDesign({ cardBackground: value })}
                />
                
                <ColorPicker
                  label="Cor de Destaque"
                  hslValue={design.accentColor}
                  onChange={(value) => updateDesign({ accentColor: value })}
                />
              </div>
            </div>

            {/* Fonts Section */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-brand-pink" />
                <h3 className="font-bold text-foreground">Fontes</h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Fonte de Títulos</label>
                  <select
                    value={design.fontDisplay}
                    onChange={(e) => updateDesign({ fontDisplay: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Fonte do Corpo</label>
                  <select
                    value={design.fontBody}
                    onChange={(e) => updateDesign({ fontBody: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Section */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-brand-pink" />
                <h3 className="font-bold text-foreground">Layout dos Cards</h3>
              </div>
              
              <div className="grid gap-3">
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => updateDesign({ cardLayout: layout.value })}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      design.cardLayout === layout.value
                        ? "border-brand-pink bg-brand-pink/10"
                        : "border-border bg-background hover:border-brand-pink/50"
                    )}
                  >
                    <h4 className="font-bold text-foreground text-sm">{layout.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja restaurar as configurações de design padrão?")) {
                  resetDesign();
                  toast.success("Design restaurado!");
                }
              }}
              className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Restaurar Design Padrão
            </button>
          </div>
        )}
      </div>

      {/* Edit/Add Item Modal */}
      {(editingItem || showAddItem) && (
        <ItemFormModal
          item={editingItem}
          categories={config.categories}
          onSave={handleSaveItem}
          onClose={() => {
            setEditingItem(null);
            setShowAddItem(false);
          }}
        />
      )}

      {/* Edit/Add Extra Modal */}
      {(editingExtra || showAddExtra) && (
        <ExtraFormModal
          extra={editingExtra}
          onSave={handleSaveExtra}
          onClose={() => {
            setEditingExtra(null);
            setShowAddExtra(false);
          }}
        />
      )}

      {/* Edit/Add Drink Modal */}
      {(editingDrink || showAddDrink) && (
        <DrinkFormModal
          drink={editingDrink}
          onSave={handleSaveDrink}
          onClose={() => {
            setEditingDrink(null);
            setShowAddDrink(false);
          }}
        />
      )}
    </div>
  );
};

// Item Form Modal
const ItemFormModal = ({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  categories: { id: string; name: string; color: string }[];
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<MenuItem>(
    item || {
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      prices: [{ size: "500ml", price: 0 }, { size: "300ml", price: 0 }],
      category: "tradicionais",
      image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop",
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (index: number, field: "size" | "price", value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const addPrice = () => {
    setFormData({
      ...formData,
      prices: [...formData.prices, { size: "", price: 0 }],
    });
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData({
        ...formData,
        prices: formData.prices.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-brand-pink">
            {item ? "Editar Item" : "Adicionar Item"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Estoque</label>
            <input
              type="number"
              value={formData.stock ?? ""}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })}
              placeholder="Deixe vazio para ilimitado"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio para estoque ilimitado. Zero = Esgotado.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Imagem</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Foto
                </button>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Ou cole URL da imagem..."
                  className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Preços</label>
              <button
                type="button"
                onClick={addPrice}
                className="text-brand-pink text-sm font-medium"
              >
                + Adicionar tamanho
              </button>
            </div>
            {formData.prices.map((price, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={price.size}
                  onChange={(e) => handlePriceChange(index, "size", e.target.value)}
                  placeholder="Tamanho (ex: 500ml)"
                  className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground"
                />
                <input
                  type="number"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, "price", parseFloat(e.target.value) || 0)}
                  placeholder="Preço"
                  className="w-24 p-3 rounded-xl border border-border bg-background text-foreground"
                  step="0.01"
                />
                {formData.prices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrice(index)}
                    className="p-3 rounded-xl bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name || formData.prices.some((p) => !p.size || p.price <= 0)}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extra Form Modal
const ExtraFormModal = ({
  extra,
  onSave,
  onClose,
}: {
  extra: { id: string; name: string; price: number; stock?: number } | null;
  onSave: (extra: { id: string; name: string; price: number; stock?: number }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState(
    extra || { id: `extra-${Date.now()}`, name: "", price: 0, stock: undefined as number | undefined }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-brand-pink">
            {extra ? "Editar Extra" : "Adicionar Extra"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Preço (R$)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Estoque</label>
            <input
              type="number"
              value={formData.stock ?? ""}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })}
              placeholder="Deixe vazio para ilimitado"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio para estoque ilimitado. Zero = Esgotado.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name || formData.price <= 0}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Drink Form Modal
const DrinkFormModal = ({
  drink,
  onSave,
  onClose,
}: {
  drink: { id: string; name: string; price: number; stock?: number } | null;
  onSave: (drink: { id: string; name: string; price: number; stock?: number }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState(
    drink || { id: `drink-${Date.now()}`, name: "", price: 0, stock: undefined as number | undefined }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-brand-pink">
            {drink ? "Editar Bebida" : "Adicionar Bebida"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Preço (R$)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Estoque</label>
            <input
              type="number"
              value={formData.stock ?? ""}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })}
              placeholder="Deixe vazio para ilimitado"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio para estoque ilimitado. Zero = Esgotado.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
