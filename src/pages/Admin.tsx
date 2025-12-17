import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/contexts/MenuContext";
import { useDesign, CardLayout, CustomFont, DesignConfig } from "@/contexts/DesignContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Trash2, Edit2, Save, X, Upload, Image, Package, Minus, Palette, Settings, List, Layers, Type, ShoppingBag, RotateCcw, Download, FolderUp } from "lucide-react";
import { MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { CheckoutStepsManager } from "@/components/admin/CheckoutStepsManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { DesignManager } from "@/components/admin/DesignManager";
import { useConfigExport } from "@/hooks/useConfigService";


const LAYOUT_OPTIONS: { value: CardLayout; label: string; description: string }[] = [
  { value: "left-filled", label: "Imagem à esquerda (Preenchido)", description: "Card com fundo colorido e imagem à esquerda" },
  { value: "right-filled", label: "Imagem à direita (Preenchido)", description: "Card com fundo colorido e imagem à direita" },
  { value: "left-bordered", label: "Imagem à esquerda (Bordas)", description: "Card com borda e imagem à esquerda" },
  { value: "right-bordered", label: "Imagem à direita (Bordas)", description: "Card com borda e imagem à direita" },
  { value: "left", label: "Imagem à esquerda (Simples)", description: "Card simples com imagem à esquerda" },
  { value: "right", label: "Imagem à direita (Simples)", description: "Card simples com imagem à direita" },
];

type TabType = "orders" | "items" | "categories" | "checkout" | "stock" | "design";

const Admin = () => {
  const { isAuthenticated, isAdmin, loading, signOut } = useAuth();
  const { config, updateMenuItem, addMenuItem, deleteMenuItem, updateExtra, addExtra, deleteExtra, updateDrinkOption, addDrinkOption, deleteDrinkOption, addAcaiTurbineItem, removeAcaiTurbineItem, updateAcaiTurbineItem, updateCategories, resetToDefault, reloadConfig: reloadMenuConfig } = useMenu();
  const { design, updateDesign, resetDesign, addCustomFont, removeCustomFont, getAllFonts } = useDesign();
  const { config: checkoutConfig, updateStep, addStep, deleteStep, reorderSteps, resetToDefault: resetCheckout, removeMenuItemFromSteps, reloadConfig: reloadCheckoutConfig } = useCheckout();
  const { exportConfig, importConfig, isExporting, isImporting } = useConfigExport();
  
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingExtra, setEditingExtra] = useState<{ id: string; name: string; price: number } | null>(null);
  const [editingDrink, setEditingDrink] = useState<{ id: string; name: string; price: number } | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importConfig(file);
    }
    e.target.value = '';
  };

  const handleSaveDesign = (newDesign: DesignConfig) => {
    updateDesign(newDesign);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-brand-pink">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
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
      // Also remove from checkout steps (linkedMenuItems, triggerItemIds)
      removeMenuItemFromSteps(id);
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

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "orders", label: "Pedidos", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "categories", label: "Categorias", icon: <Layers className="w-4 h-4" /> },
    { id: "items", label: "Itens do Cardápio" },
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
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-sm"
              title="Importar configuração"
            >
              <FolderUp className="w-4 h-4" />
              <span className="hidden sm:inline">{isImporting ? "Importando..." : "Importar"}</span>
            </button>
            <button
              onClick={exportConfig}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-sm"
              title="Exportar configuração"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isExporting ? "Exportando..." : "Exportar"}</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
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
        {activeTab === "orders" && (
          <OrdersManager />
        )}

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

        {activeTab === "checkout" && (
          <CheckoutStepsManager
            steps={checkoutConfig.steps}
            menuItems={config.menuItems}
            categories={config.categories}
            onUpdate={updateStep}
            onAdd={addStep}
            onDelete={deleteStep}
            onReorder={reorderSteps}
            onResetToDefault={resetCheckout}
          />
        )}

{activeTab === "stock" && (
  <div className="space-y-6">
    <div className="flex justify-end">
      <button
        onClick={() => {
          reloadMenuConfig();
          reloadCheckoutConfig();
          toast.success("Estoque atualizado!");
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm"
        title="Atualizar lista de estoque"
      >
        <RotateCcw className="w-4 h-4" />
        Atualizar estoque
      </button>
    </div>

    {/* Menu Items Stock */}
    <div className="space-y-4">
      <h2 className="font-display text-xl text-brand-pink">Itens do Cardápio</h2>
      {config.menuItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl bg-card border border-border",
                    item.stock === 0 && "opacity-50"
                  )}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                      {item.stock === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">Esgotado</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.stock === undefined ? "Estoque ilimitado" : `Estoque: ${item.stock}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateMenuItem({ ...item, stock: undefined })}
                      className={cn(
                        "px-2 py-1 rounded text-xs",
                        item.stock === undefined 
                          ? "bg-brand-pink text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      ∞
                    </button>
                    <button
                      onClick={() => {
                        const currentStock = item.stock ?? 0;
                        if (currentStock > 0) {
                          updateMenuItem({ ...item, stock: currentStock - 1 });
                        }
                      }}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-foreground">
                      {item.stock ?? "∞"}
                    </span>
                    <button
                      onClick={() => {
                        const currentStock = item.stock ?? 0;
                        updateMenuItem({ ...item, stock: currentStock + 1 });
                      }}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {checkoutConfig.steps
              .filter(step => step.options && step.options.some(o => o.trackStock))
              .map((step) => (
                <div key={step.id} className="space-y-4">
                  <h2 className="font-display text-xl text-brand-pink">{step.title}</h2>
                  {step.options.filter(o => o.trackStock).map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl bg-card border border-border",
                        option.stock === 0 && "opacity-50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-sm">{step.title} — {option.name}</h3>
                        {option.stock === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">Esgotado</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.stock === undefined ? "Estoque ilimitado" : `Estoque: ${option.stock}`}
                          {option.price > 0 && ` • R$ ${option.price.toFixed(2).replace(".", ",")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updatedOptions = step.options.map(o =>
                              o.id === option.id ? { ...o, stock: undefined } : o
                            );
                            updateStep({ ...step, options: updatedOptions });
                          }}
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            option.stock === undefined 
                              ? "bg-brand-pink text-primary-foreground" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          ∞
                        </button>
                        <button
                          onClick={() => {
                            const currentStock = option.stock ?? 0;
                            if (currentStock > 0) {
                              const updatedOptions = step.options.map(o =>
                                o.id === option.id ? { ...o, stock: currentStock - 1 } : o
                              );
                              updateStep({ ...step, options: updatedOptions });
                            }
                          }}
                          className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-foreground">
                          {option.stock ?? "∞"}
                        </span>
                        <button
                          onClick={() => {
                            const currentStock = option.stock ?? 0;
                            const updatedOptions = step.options.map(o =>
                              o.id === option.id ? { ...o, stock: currentStock + 1 } : o
                            );
                            updateStep({ ...step, options: updatedOptions });
                          }}
                          className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {activeTab === "design" && (
          <DesignManager
            design={design}
            onSave={handleSaveDesign}
            onReset={resetDesign}
            onAddCustomFont={addCustomFont}
            onRemoveCustomFont={removeCustomFont}
            getAllFonts={getAllFonts}
            onGoToCategories={() => setActiveTab("categories")}
          />
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
      category: categories.length > 0 ? categories[0].id : "",
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Digite o nome do item");
      return;
    }
    if (categories.length === 0) {
      toast.error("Crie uma categoria antes de adicionar itens");
      return;
    }
    if (!formData.category || !categories.find(c => c.id === formData.category)) {
      toast.error("Selecione uma categoria válida");
      return;
    }
    onSave(formData);
  };

  // If no categories exist, show a message
  if (categories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card rounded-2xl shadow-lg max-w-md w-full p-6 text-center">
          <h2 className="font-display text-xl text-brand-pink mb-4">
            Nenhuma categoria encontrada
          </h2>
          <p className="text-muted-foreground mb-4">
            Você precisa criar pelo menos uma categoria antes de adicionar itens ao cardápio.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
          >
            Entendi
          </button>
        </div>
      </div>
    );
  }

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
            <label className="text-sm font-medium text-foreground">Nome *</label>
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
            <label className="text-sm font-medium text-foreground">Categoria *</label>
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
              <div className="flex-1">
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
                  Upload
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Preços</label>
              <button
                onClick={addPrice}
                className="text-xs px-2 py-1 rounded bg-brand-pink text-primary-foreground"
              >
                + Tamanho
              </button>
            </div>
            {formData.prices.map((price, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={price.size}
                  onChange={(e) => handlePriceChange(index, "size", e.target.value)}
                  placeholder="Tamanho"
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
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
            >
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
  extra: { id: string; name: string; price: number } | null;
  onSave: (extra: { id: string; name: string; price: number }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState(
    extra || {
      id: `extra-${Date.now()}`,
      name: "",
      price: 0,
    }
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

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
            >
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
  drink: { id: string; name: string; price: number } | null;
  onSave: (drink: { id: string; name: string; price: number }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState(
    drink || {
      id: `drink-${Date.now()}`,
      name: "",
      price: 0,
    }
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
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
