import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, GripVertical, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MenuItem } from "@/data/menuData";
import { isValidHex, normalizeHex } from "@/lib/colorUtils";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerProps {
  categories: Category[];
  menuItems: MenuItem[];
  onUpdate: (categories: Category[]) => void;
}

const PRESET_COLORS = [
  { name: "Rosa Pastel", value: "pastel-pink" },
  { name: "Pêssego", value: "pastel-peach" },
  { name: "Azul Pastel", value: "pastel-blue" },
  { name: "Lavanda", value: "pastel-lavender" },
  { name: "Menta", value: "pastel-mint" },
  { name: "Amarelo", value: "pastel-yellow" },
];

const isCustomHexColor = (color: string) => {
  return color.startsWith('#') || isValidHex(color);
};

export const CategoryManager = ({ categories, menuItems, onUpdate }: CategoryManagerProps) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", color: "pastel-pink" });
  const [customHexNew, setCustomHexNew] = useState("");
  const [customHexEdit, setCustomHexEdit] = useState("");

  const getItemsInCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category === categoryId);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    
    onUpdate(
      categories.map((c) =>
        c.id === editingCategory.id ? editingCategory : c
      )
    );
    setEditingCategory(null);
    toast.success("Categoria atualizada!");
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }

    const id = newCategory.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    if (categories.some(c => c.id === id)) {
      toast.error("Já existe uma categoria com esse nome");
      return;
    }

    onUpdate([...categories, { id, name: newCategory.name, color: newCategory.color }]);
    setNewCategory({ name: "", color: "pastel-pink" });
    setShowAddForm(false);
    toast.success("Categoria adicionada!");
  };

  const handleDeleteCategory = (id: string) => {
    const itemsInCategory = getItemsInCategory(id);
    
    if (itemsInCategory.length > 0) {
      toast.error(`Não é possível remover: existem ${itemsInCategory.length} item(s) nesta categoria`);
      return;
    }
    
    if (confirm("Tem certeza que deseja remover esta categoria?")) {
      onUpdate(categories.filter((c) => c.id !== id));
      toast.success("Categoria removida!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          Gerencie as categorias do cardápio. Você pode alterar nomes, cores e adicionar novas categorias.
          <br />
          <strong>Nota:</strong> Só é possível remover categorias que não possuem itens.
        </p>
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors w-full justify-center"
      >
        <Plus className="w-5 h-5" />
        Adicionar Categoria
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-4">
          <h3 className="font-bold text-foreground">Nova Categoria</h3>
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Nome da categoria..."
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Cor</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setNewCategory({ ...newCategory, color: color.value });
                    setCustomHexNew("");
                  }}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-sm",
                    `bg-${color.value}`,
                    newCategory.color === color.value && !isCustomHexColor(newCategory.color)
                      ? "border-brand-pink"
                      : "border-transparent"
                  )}
                >
                  {color.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={customHexNew}
                onChange={(e) => setCustomHexNew(e.target.value)}
                placeholder="#FF5733"
                className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
              <button
                onClick={() => {
                  if (isValidHex(customHexNew)) {
                    setNewCategory({ ...newCategory, color: normalizeHex(customHexNew) });
                    toast.success("Cor personalizada aplicada!");
                  } else {
                    toast.error("Formato hexadecimal inválido (ex: #FF5733)");
                  }
                }}
                className="px-3 py-2 rounded-lg bg-brand-pink text-primary-foreground text-sm hover:opacity-90"
              >
                Aplicar
              </button>
              {isCustomHexColor(newCategory.color) && (
                <div
                  className="w-8 h-8 rounded-lg border-2 border-brand-pink"
                  style={{ backgroundColor: newCategory.color }}
                />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddCategory}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.map((category) => {
        const itemCount = getItemsInCategory(category.id).length;
        
        const hasCustomColor = isCustomHexColor(category.color);
        
        return (
          <div
            key={category.id}
            className={cn(
              "p-4 rounded-xl border border-border",
              !hasCustomColor && `bg-${category.color}`
            )}
            style={hasCustomColor ? { backgroundColor: category.color } : undefined}
          >
            {editingCategory?.id === category.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
                />
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setEditingCategory({ ...editingCategory, color: color.value });
                        setCustomHexEdit("");
                      }}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all text-xs",
                        `bg-${color.value}`,
                        editingCategory.color === color.value && !isCustomHexColor(editingCategory.color)
                          ? "border-brand-pink"
                          : "border-transparent"
                      )}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={customHexEdit}
                    onChange={(e) => setCustomHexEdit(e.target.value)}
                    placeholder="#FF5733"
                    className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  />
                  <button
                    onClick={() => {
                      if (isValidHex(customHexEdit)) {
                        setEditingCategory({ ...editingCategory, color: normalizeHex(customHexEdit) });
                        toast.success("Cor personalizada aplicada!");
                      } else {
                        toast.error("Formato hexadecimal inválido (ex: #FF5733)");
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-brand-pink text-primary-foreground text-sm hover:opacity-90"
                  >
                    Aplicar
                  </button>
                  {isCustomHexColor(editingCategory.color) && (
                    <div
                      className="w-6 h-6 rounded-lg border-2 border-brand-pink"
                      style={{ backgroundColor: editingCategory.color }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-medium hover:bg-muted/80 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="flex-1 py-2 rounded-lg bg-brand-pink text-primary-foreground font-medium hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <span className="font-bold text-foreground">{category.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({itemCount} {itemCount === 1 ? "item" : "itens"})
                  </span>
                </div>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 rounded-lg bg-background/50 text-foreground hover:bg-background/80"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={itemCount > 0}
                  className={cn(
                    "p-2 rounded-lg",
                    itemCount > 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  )}
                  title={itemCount > 0 ? "Remova os itens desta categoria primeiro" : "Remover categoria"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryManager;