import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, ChevronUp, ChevronDown, Filter, DollarSign, RotateCcw, Ban } from "lucide-react";
import { CheckoutStep, PricingRule } from "@/data/checkoutConfig";
import { MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CheckoutStepsManagerProps {
  steps: CheckoutStep[];
  menuItems: MenuItem[];
  categories: Category[];
  onUpdate: (step: CheckoutStep) => void;
  onAdd: (step: CheckoutStep) => void;
  onDelete: (id: string) => void;
  onReorder: (steps: CheckoutStep[]) => void;
  onResetToDefault: () => void;
}

const STEP_TYPE_LABELS: Record<string, string> = {
  delivery: "Tipo de entrega",
  name: "Nome do cliente",
  extras: "Extras (Turbinar)",
  drinks: "Bebidas",
  custom_select: "Seleção personalizada",
  custom_text: "Campo de texto",
};

const defaultPricingRule: PricingRule = {
  enabled: false,
  freeItemsLimit: 0,
  ruleType: "per_item",
  pricePerItem: 0,
  flatPrice: 0,
};

export const CheckoutStepsManager = ({
  steps,
  menuItems,
  categories,
  onUpdate,
  onAdd,
  onDelete,
  onReorder,
  onResetToDefault,
}: CheckoutStepsManagerProps) => {
  // Local state that holds changes until save is clicked
  const [localSteps, setLocalSteps] = useState<CheckoutStep[]>(steps);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [editingStep, setEditingStep] = useState<CheckoutStep | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editOptionPrice, setEditOptionPrice] = useState("");
  const [newStep, setNewStep] = useState<Partial<CheckoutStep>>({
    title: "",
    subtitle: "",
    type: "custom_select",
    enabled: true,
    required: false,
    multiSelect: false,
    showForTable: true,
    showCondition: "always",
    triggerItemIds: [],
    triggerCategoryIds: [],
    options: [],
    pricingRule: { ...defaultPricingRule },
    maxSelectionsEnabled: false,
    maxSelections: 3,
  });

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState("");

  // Sync local state when props change (e.g., after reset)
  useEffect(() => {
    setLocalSteps(steps);
    setHasUnsavedChanges(false);
  }, [steps]);

  // Update a step in local state
  const updateLocalStep = useCallback((step: CheckoutStep) => {
    setLocalSteps(prev => prev.map(s => s.id === step.id ? step : s));
    setHasUnsavedChanges(true);
  }, []);

  // Reorder steps in local state
  const reorderLocalSteps = useCallback((newSteps: CheckoutStep[]) => {
    setLocalSteps(newSteps);
    setHasUnsavedChanges(true);
  }, []);

  // Delete a step from local state
  const deleteLocalStep = useCallback((id: string) => {
    if (id === "delivery" || id === "name") {
      toast.error("Esta etapa é obrigatória e não pode ser removida");
      return;
    }
    setLocalSteps(prev => prev.filter(s => s.id !== id));
    setHasUnsavedChanges(true);
    toast.success("Etapa removida!");
  }, []);

  // Add a step to local state
  const addLocalStep = useCallback((step: CheckoutStep) => {
    setLocalSteps(prev => [...prev, step]);
    setHasUnsavedChanges(true);
  }, []);

  // Save all changes to context
  const handleSaveAllChanges = () => {
    // Apply all local changes to the context
    onReorder(localSteps);
    setHasUnsavedChanges(false);
    toast.success("Configurações salvas!");
  };

  // Discard all changes
  const handleDiscardChanges = () => {
    setLocalSteps(steps);
    setHasUnsavedChanges(false);
    toast.success("Alterações descartadas!");
  };

  // Reset to default configuration
  const handleResetToDefault = () => {
    if (confirm("Tem certeza que deseja restaurar as etapas para o padrão inicial? Todas as suas configurações serão perdidas.")) {
      onResetToDefault();
      toast.success("Configurações restauradas para o padrão!");
    }
  };

  const handleSaveStep = () => {
    if (!editingStep) return;
    updateLocalStep(editingStep);
    setEditingStep(null);
    toast.success("Etapa atualizada localmente. Clique em 'Salvar Configurações' para aplicar.");
  };

  const handleAddStep = () => {
    if (!newStep.title?.trim()) {
      toast.error("Digite um título para a etapa");
      return;
    }

    const id = `step-${Date.now()}`;
    addLocalStep({
      id,
      type: newStep.type || "custom_select",
      title: newStep.title,
      subtitle: newStep.subtitle,
      enabled: newStep.enabled ?? true,
      required: newStep.required ?? false,
      multiSelect: newStep.multiSelect ?? false,
      showForTable: newStep.showForTable ?? true,
      showCondition: newStep.showCondition || "always",
      triggerItemIds: newStep.triggerItemIds || [],
      triggerCategoryIds: newStep.triggerCategoryIds || [],
      options: newStep.options || [],
      pricingRule: newStep.pricingRule,
      maxSelectionsEnabled: newStep.maxSelectionsEnabled,
      maxSelections: newStep.maxSelections,
    });

    setNewStep({
      title: "",
      subtitle: "",
      type: "custom_select",
      enabled: true,
      required: false,
      multiSelect: false,
      showForTable: true,
      showCondition: "always",
      triggerItemIds: [],
      triggerCategoryIds: [],
      options: [],
      pricingRule: { ...defaultPricingRule },
      maxSelectionsEnabled: false,
      maxSelections: 3,
    });
    setShowAddForm(false);
    toast.success("Etapa adicionada localmente. Clique em 'Salvar Configurações' para aplicar.");
  };

  const addOptionToStep = (step: CheckoutStep, isEditing: boolean) => {
    if (!newOptionName.trim()) {
      toast.error("Digite um nome para a opção");
      return;
    }
    
    const newOption = {
      id: `opt-${Date.now()}`,
      name: newOptionName.trim(),
      price: parseFloat(newOptionPrice) || 0,
    };
    
    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: [...(editingStep.options || []), newOption],
      });
    } else if (!isEditing) {
      setNewStep({
        ...newStep,
        options: [...(newStep.options || []), newOption],
      });
    }
    
    setNewOptionName("");
    setNewOptionPrice("");
  };

  const startEditingOption = (option: { id: string; name: string; price: number }) => {
    setEditingOptionId(option.id);
    setEditOptionName(option.name);
    setEditOptionPrice(option.price.toString());
  };

  const saveEditingOption = (isEditing: boolean) => {
    if (!editingOptionId || !editOptionName.trim()) {
      toast.error("Digite um nome para a opção");
      return;
    }

    const updatedOption = {
      id: editingOptionId,
      name: editOptionName.trim(),
      price: parseFloat(editOptionPrice) || 0,
    };

    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: editingStep.options.map(o => 
          o.id === editingOptionId ? { ...o, ...updatedOption } : o
        ),
      });
    } else {
      setNewStep({
        ...newStep,
        options: (newStep.options || []).map(o => 
          o.id === editingOptionId ? { ...o, ...updatedOption } : o
        ),
      });
    }

    setEditingOptionId(null);
    setEditOptionName("");
    setEditOptionPrice("");
  };

  const cancelEditingOption = () => {
    setEditingOptionId(null);
    setEditOptionName("");
    setEditOptionPrice("");
  };

  const removeOptionFromStep = (optionId: string, isEditing: boolean) => {
    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: editingStep.options.filter(o => o.id !== optionId),
      });
    } else {
      setNewStep({
        ...newStep,
        options: (newStep.options || []).filter(o => o.id !== optionId),
      });
    }
  };

  const handleDeleteStep = (id: string) => {
    deleteLocalStep(id);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localSteps.length) return;

    const newSteps = [...localSteps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    reorderLocalSteps(newSteps);
  };

  const toggleEnabled = (step: CheckoutStep) => {
    updateLocalStep({ ...step, enabled: !step.enabled });
  };

  const toggleItemInTriggerList = (step: CheckoutStep, itemId: string) => {
    const currentIds = step.triggerItemIds || [];
    const newIds = currentIds.includes(itemId)
      ? currentIds.filter(id => id !== itemId)
      : [...currentIds, itemId];
    
    if (step === editingStep) {
      setEditingStep({ ...step, triggerItemIds: newIds });
    } else {
      updateLocalStep({ ...step, triggerItemIds: newIds });
    }
  };

  const toggleCategoryInTriggerList = (step: CheckoutStep, categoryId: string) => {
    const currentIds = step.triggerCategoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter(id => id !== categoryId)
      : [...currentIds, categoryId];
    
    if (step === editingStep) {
      setEditingStep({ ...step, triggerCategoryIds: newIds });
    } else {
      updateLocalStep({ ...step, triggerCategoryIds: newIds });
    }
  };

  const isBuiltInStep = (id: string) => id === "delivery" || id === "name";

  const renderConditionSelector = (step: CheckoutStep, isEditing: boolean) => {
    const currentStep = isEditing && editingStep ? editingStep : step;
    const showCondition = currentStep.showCondition || "always";
    
    return (
      <div className="space-y-3 mt-3 p-3 rounded-lg bg-muted/50 border border-border">
        <label className="text-sm font-medium text-foreground">Quando mostrar esta etapa?</label>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              const updated = { ...currentStep, showCondition: "always" as const, triggerItemIds: [], triggerCategoryIds: [] };
              isEditing ? setEditingStep(updated) : updateLocalStep(updated);
            }}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "always"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Sempre
          </button>
          <button
            onClick={() => {
              const updated = { ...currentStep, showCondition: "specific_items" as const, triggerCategoryIds: [] };
              isEditing ? setEditingStep(updated) : updateLocalStep(updated);
            }}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "specific_items"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Itens específicos
          </button>
          <button
            onClick={() => {
              const updated = { ...currentStep, showCondition: "specific_categories" as const, triggerItemIds: [] };
              isEditing ? setEditingStep(updated) : updateLocalStep(updated);
            }}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "specific_categories"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Categorias
          </button>
        </div>

        {showCondition === "specific_items" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecione os itens do cardápio que irão mostrar esta etapa:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {menuItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(currentStep.triggerItemIds || []).includes(item.id)}
                    onChange={() => toggleItemInTriggerList(currentStep, item.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {categories.find(c => c.id === item.category)?.name || item.category}
                  </span>
                </label>
              ))}
            </div>
            {(currentStep.triggerItemIds || []).length > 0 && (
              <p className="text-xs text-brand-pink">
                {(currentStep.triggerItemIds || []).length} item(s) selecionado(s)
              </p>
            )}
          </div>
        )}

        {showCondition === "specific_categories" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecione as categorias que irão mostrar esta etapa:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(currentStep.triggerCategoryIds || []).includes(category.id)}
                    onChange={() => toggleCategoryInTriggerList(currentStep, category.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </label>
              ))}
            </div>
            {(currentStep.triggerCategoryIds || []).length > 0 && (
              <p className="text-xs text-brand-pink">
                {(currentStep.triggerCategoryIds || []).length} categoria(s) selecionada(s)
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNewStepConditionSelector = () => {
    const showCondition = newStep.showCondition || "always";
    
    return (
      <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
        <label className="text-sm font-medium text-foreground">Quando mostrar esta etapa?</label>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setNewStep({ ...newStep, showCondition: "always", triggerItemIds: [], triggerCategoryIds: [] })}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "always"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Sempre
          </button>
          <button
            onClick={() => setNewStep({ ...newStep, showCondition: "specific_items", triggerCategoryIds: [] })}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "specific_items"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Itens específicos
          </button>
          <button
            onClick={() => setNewStep({ ...newStep, showCondition: "specific_categories", triggerItemIds: [] })}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "specific_categories"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Categorias
          </button>
        </div>

        {showCondition === "specific_items" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecione os itens do cardápio que irão mostrar esta etapa:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {menuItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(newStep.triggerItemIds || []).includes(item.id)}
                    onChange={() => {
                      const currentIds = newStep.triggerItemIds || [];
                      const newIds = currentIds.includes(item.id)
                        ? currentIds.filter(id => id !== item.id)
                        : [...currentIds, item.id];
                      setNewStep({ ...newStep, triggerItemIds: newIds });
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {categories.find(c => c.id === item.category)?.name || item.category}
                  </span>
                </label>
              ))}
            </div>
            {(newStep.triggerItemIds || []).length > 0 && (
              <p className="text-xs text-brand-pink">
                {(newStep.triggerItemIds || []).length} item(s) selecionado(s)
              </p>
            )}
          </div>
        )}

        {showCondition === "specific_categories" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecione as categorias que irão mostrar esta etapa:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(newStep.triggerCategoryIds || []).includes(category.id)}
                    onChange={() => {
                      const currentIds = newStep.triggerCategoryIds || [];
                      const newIds = currentIds.includes(category.id)
                        ? currentIds.filter(id => id !== category.id)
                        : [...currentIds, category.id];
                      setNewStep({ ...newStep, triggerCategoryIds: newIds });
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </label>
              ))}
            </div>
            {(newStep.triggerCategoryIds || []).length > 0 && (
              <p className="text-xs text-brand-pink">
                {(newStep.triggerCategoryIds || []).length} categoria(s) selecionada(s)
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const getConditionSummary = (step: CheckoutStep) => {
    const condition = step.showCondition || "always";
    if (condition === "specific_items") {
      return `${(step.triggerItemIds || []).length} item(s)`;
    }
    if (condition === "specific_categories") {
      return `${(step.triggerCategoryIds || []).length} categoria(s)`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Save/Discard/Reset Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSaveAllChanges}
          disabled={!hasUnsavedChanges}
          className={cn(
            "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors justify-center",
            hasUnsavedChanges
              ? "bg-brand-pink text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Save className="w-5 h-5" />
          Salvar Configurações
        </button>
        
        {hasUnsavedChanges && (
          <button
            onClick={handleDiscardChanges}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
            Descartar
          </button>
        )}
        
        <button
          onClick={handleResetToDefault}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Restaurar Padrão
        </button>
      </div>

      {hasUnsavedChanges && (
        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicar.
          </p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          Configure as etapas que aparecem antes do envio do pedido. Você pode renomear, 
          habilitar/desabilitar, reordenar e adicionar novas etapas. Também pode definir
          se a etapa aparece sempre, apenas para itens específicos ou para categorias específicas.
        </p>
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90 transition-colors w-full justify-center"
      >
        <Plus className="w-5 h-5" />
        Adicionar Etapa
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-4">
          <h3 className="font-bold text-foreground">Nova Etapa</h3>
          
          <div>
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              type="text"
              value={newStep.title}
              onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
              placeholder="Ex: Deseja adicionar algo?"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Subtítulo (opcional)</label>
            <input
              type="text"
              value={newStep.subtitle}
              onChange={(e) => setNewStep({ ...newStep, subtitle: e.target.value })}
              placeholder="Ex: Escolha uma opção abaixo"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newStep.multiSelect}
                onChange={(e) => setNewStep({ ...newStep, multiSelect: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
              <span className="text-sm text-foreground">Múltipla escolha</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newStep.showForTable}
                onChange={(e) => setNewStep({ ...newStep, showForTable: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
              <span className="text-sm text-foreground">Mostrar para mesa</span>
            </label>
          </div>

          {renderNewStepConditionSelector()}

          {/* Options for custom_select */}
          {newStep.type === "custom_select" && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
              <label className="text-sm font-medium text-foreground">Opções da etapa</label>
              
              {(newStep.options || []).length > 0 && (
                <div className="space-y-2">
                  {(newStep.options || []).map((option) => (
                    <div key={option.id}>
                      {editingOptionId === option.id ? (
                        <div className="flex gap-2 p-2 rounded-lg bg-background">
                          <input
                            type="text"
                            value={editOptionName}
                            onChange={(e) => setEditOptionName(e.target.value)}
                            className="flex-1 p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                          />
                          <input
                            type="number"
                            value={editOptionPrice}
                            onChange={(e) => setEditOptionPrice(e.target.value)}
                            className="w-20 p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                            min="0"
                            step="0.01"
                          />
                          <button
                            onClick={() => saveEditingOption(false)}
                            className="p-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEditingOption}
                            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-background">
                          <span className="text-sm text-foreground">{option.name}</span>
                          <div className="flex items-center gap-2">
                            {option.price > 0 && (
                              <span className="text-xs text-brand-pink">
                                +R$ {option.price.toFixed(2).replace(".", ",")}
                              </span>
                            )}
                            <button
                              onClick={() => startEditingOption(option)}
                              className="p-1 rounded text-muted-foreground hover:bg-muted"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeOptionFromStep(option.id, false)}
                              className="p-1 rounded text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder="Nome da opção"
                  className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
                <input
                  type="number"
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(e.target.value)}
                  placeholder="Preço"
                  className="w-20 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={() => addOptionToStep({} as CheckoutStep, false)}
                  className="p-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Pricing Rules */}
              {newStep.multiSelect && (
                <div className="mt-4 p-3 rounded-lg bg-background border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-pink" />
                    <label className="text-sm font-medium text-foreground">Regras de preço</label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStep.pricingRule?.enabled || false}
                      onChange={(e) => setNewStep({
                        ...newStep,
                        pricingRule: { ...(newStep.pricingRule || defaultPricingRule), enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Usar regra de preço personalizada</span>
                  </label>

                  {newStep.pricingRule?.enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Itens grátis (antes de cobrar)</label>
                        <input
                          type="number"
                          value={newStep.pricingRule?.freeItemsLimit || 0}
                          onChange={(e) => setNewStep({
                            ...newStep,
                            pricingRule: { ...(newStep.pricingRule || defaultPricingRule), freeItemsLimit: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Tipo de cobrança</label>
                        <select
                          value={newStep.pricingRule?.ruleType || "per_item"}
                          onChange={(e) => setNewStep({
                            ...newStep,
                            pricingRule: { ...(newStep.pricingRule || defaultPricingRule), ruleType: e.target.value as any }
                          })}
                          className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                        >
                          <option value="per_item">Cobrar por cada item selecionado</option>
                          <option value="per_item_after_limit">Cobrar por item após limite grátis</option>
                          <option value="flat_after_limit">Valor fixo após limite grátis</option>
                        </select>
                      </div>

                      {(newStep.pricingRule?.ruleType === "per_item" || newStep.pricingRule?.ruleType === "per_item_after_limit") && (
                        <div>
                          <label className="text-xs text-muted-foreground">Preço por item (R$)</label>
                          <input
                            type="number"
                            value={newStep.pricingRule?.pricePerItem || 0}
                            onChange={(e) => setNewStep({
                              ...newStep,
                              pricingRule: { ...(newStep.pricingRule || defaultPricingRule), pricePerItem: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}

                      {newStep.pricingRule?.ruleType === "flat_after_limit" && (
                        <div>
                          <label className="text-xs text-muted-foreground">Valor fixo após limite (R$)</label>
                          <input
                            type="number"
                            value={newStep.pricingRule?.flatPrice || 0}
                            onChange={(e) => setNewStep({
                              ...newStep,
                              pricingRule: { ...(newStep.pricingRule || defaultPricingRule), flatPrice: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {newStep.pricingRule?.ruleType === "per_item" && 
                          `Cada item custa R$ ${(newStep.pricingRule?.pricePerItem || 0).toFixed(2).replace(".", ",")}`}
                        {newStep.pricingRule?.ruleType === "per_item_after_limit" && 
                          `${newStep.pricingRule?.freeItemsLimit || 0} item(s) grátis, depois R$ ${(newStep.pricingRule?.pricePerItem || 0).toFixed(2).replace(".", ",")} cada`}
                        {newStep.pricingRule?.ruleType === "flat_after_limit" && 
                          `${newStep.pricingRule?.freeItemsLimit || 0} item(s) grátis, depois R$ ${(newStep.pricingRule?.flatPrice || 0).toFixed(2).replace(".", ",")} fixo`}
                      </p>
                    </div>
                      )}
                    </div>
                  )}

                  {/* Max Selections Limit */}
                  {newStep.multiSelect && (
                    <div className="mt-4 p-3 rounded-lg bg-background border border-border space-y-3">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-brand-pink" />
                        <label className="text-sm font-medium text-foreground">Limite de seleções</label>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStep.maxSelectionsEnabled || false}
                          onChange={(e) => setNewStep({
                            ...newStep,
                            maxSelectionsEnabled: e.target.checked
                          })}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm text-foreground">Limitar quantidade de escolhas</span>
                      </label>

                      {newStep.maxSelectionsEnabled && (
                        <div>
                          <label className="text-xs text-muted-foreground">Máximo de itens que podem ser selecionados</label>
                          <input
                            type="number"
                            value={newStep.maxSelections || 3}
                            onChange={(e) => setNewStep({
                              ...newStep,
                              maxSelections: parseInt(e.target.value) || 1
                            })}
                            className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                            min="1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente poderá selecionar no máximo {newStep.maxSelections || 3} item(s)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddStep}
              className="flex-1 py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Steps List */}
      {localSteps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "p-4 rounded-xl border border-border bg-card",
            !step.enabled && "opacity-50"
          )}
        >
          {editingStep?.id === step.id ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Título</label>
                <input
                  type="text"
                  value={editingStep.title}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, title: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Subtítulo (opcional)</label>
                <input
                  type="text"
                  value={editingStep.subtitle || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, subtitle: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
                />
              </div>

              {!isBuiltInStep(step.id) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingStep.multiSelect}
                        onChange={(e) =>
                          setEditingStep({ ...editingStep, multiSelect: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm text-foreground">Múltipla escolha</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingStep.showForTable}
                        onChange={(e) =>
                          setEditingStep({ ...editingStep, showForTable: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm text-foreground">Mostrar para mesa</span>
                    </label>
                  </div>

                  {renderConditionSelector(step, true)}

                  {/* Options for custom_select when editing */}
                  {editingStep.type === "custom_select" && (
                    <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <label className="text-sm font-medium text-foreground">Opções da etapa</label>
                      
                      {editingStep.options.length > 0 && (
                        <div className="space-y-2">
                          {editingStep.options.map((option) => (
                            <div key={option.id}>
                              {editingOptionId === option.id ? (
                                <div className="flex gap-2 p-2 rounded-lg bg-background">
                                  <input
                                    type="text"
                                    value={editOptionName}
                                    onChange={(e) => setEditOptionName(e.target.value)}
                                    className="flex-1 p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={editOptionPrice}
                                    onChange={(e) => setEditOptionPrice(e.target.value)}
                                    className="w-20 p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                                    min="0"
                                    step="0.01"
                                  />
                                  <button
                                    onClick={() => saveEditingOption(true)}
                                    className="p-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={cancelEditingOption}
                                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2 rounded-lg bg-background">
                                  <span className="text-sm text-foreground">{option.name}</span>
                                  <div className="flex items-center gap-2">
                                    {option.price > 0 && (
                                      <span className="text-xs text-brand-pink">
                                        +R$ {option.price.toFixed(2).replace(".", ",")}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => startEditingOption(option)}
                                      className="p-1 rounded text-muted-foreground hover:bg-muted"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeOptionFromStep(option.id, true)}
                                      className="p-1 rounded text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOptionName}
                          onChange={(e) => setNewOptionName(e.target.value)}
                          placeholder="Nome da opção"
                          className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        />
                        <input
                          type="number"
                          value={newOptionPrice}
                          onChange={(e) => setNewOptionPrice(e.target.value)}
                          placeholder="Preço"
                          className="w-20 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => addOptionToStep(editingStep, true)}
                          className="p-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Pricing Rules when editing */}
                      {editingStep.multiSelect && (
                        <div className="mt-4 p-3 rounded-lg bg-background border border-border space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-brand-pink" />
                            <label className="text-sm font-medium text-foreground">Regras de preço</label>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingStep.pricingRule?.enabled || false}
                              onChange={(e) => setEditingStep({
                                ...editingStep,
                                pricingRule: { ...(editingStep.pricingRule || defaultPricingRule), enabled: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm text-foreground">Usar regra de preço personalizada</span>
                          </label>

                          {editingStep.pricingRule?.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-muted-foreground">Itens grátis (antes de cobrar)</label>
                                <input
                                  type="number"
                                  value={editingStep.pricingRule?.freeItemsLimit || 0}
                                  onChange={(e) => setEditingStep({
                                    ...editingStep,
                                    pricingRule: { ...(editingStep.pricingRule || defaultPricingRule), freeItemsLimit: parseInt(e.target.value) || 0 }
                                  })}
                                  className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                                  min="0"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-muted-foreground">Tipo de cobrança</label>
                                <select
                                  value={editingStep.pricingRule?.ruleType || "per_item"}
                                  onChange={(e) => setEditingStep({
                                    ...editingStep,
                                    pricingRule: { ...(editingStep.pricingRule || defaultPricingRule), ruleType: e.target.value as any }
                                  })}
                                  className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                                >
                                  <option value="per_item">Cobrar por cada item selecionado</option>
                                  <option value="per_item_after_limit">Cobrar por item após limite grátis</option>
                                  <option value="flat_after_limit">Valor fixo após limite grátis</option>
                                </select>
                              </div>

                              {(editingStep.pricingRule?.ruleType === "per_item" || editingStep.pricingRule?.ruleType === "per_item_after_limit") && (
                                <div>
                                  <label className="text-xs text-muted-foreground">Preço por item (R$)</label>
                                  <input
                                    type="number"
                                    value={editingStep.pricingRule?.pricePerItem || 0}
                                    onChange={(e) => setEditingStep({
                                      ...editingStep,
                                      pricingRule: { ...(editingStep.pricingRule || defaultPricingRule), pricePerItem: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              )}

                              {editingStep.pricingRule?.ruleType === "flat_after_limit" && (
                                <div>
                                  <label className="text-xs text-muted-foreground">Valor fixo após limite (R$)</label>
                                  <input
                                    type="number"
                                    value={editingStep.pricingRule?.flatPrice || 0}
                                    onChange={(e) => setEditingStep({
                                      ...editingStep,
                                      pricingRule: { ...(editingStep.pricingRule || defaultPricingRule), flatPrice: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground">
                                {editingStep.pricingRule?.ruleType === "per_item" && 
                                  `Cada item custa R$ ${(editingStep.pricingRule?.pricePerItem || 0).toFixed(2).replace(".", ",")}`}
                                {editingStep.pricingRule?.ruleType === "per_item_after_limit" && 
                                  `${editingStep.pricingRule?.freeItemsLimit || 0} item(s) grátis, depois R$ ${(editingStep.pricingRule?.pricePerItem || 0).toFixed(2).replace(".", ",")} cada`}
                                {editingStep.pricingRule?.ruleType === "flat_after_limit" && 
                                  `${editingStep.pricingRule?.freeItemsLimit || 0} item(s) grátis, depois R$ ${(editingStep.pricingRule?.flatPrice || 0).toFixed(2).replace(".", ",")} fixo`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Max Selections Limit when editing */}
                      {editingStep.multiSelect && (
                        <div className="mt-4 p-3 rounded-lg bg-background border border-border space-y-3">
                          <div className="flex items-center gap-2">
                            <Ban className="w-4 h-4 text-brand-pink" />
                            <label className="text-sm font-medium text-foreground">Limite de seleções</label>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingStep.maxSelectionsEnabled || false}
                              onChange={(e) => setEditingStep({
                                ...editingStep,
                                maxSelectionsEnabled: e.target.checked
                              })}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm text-foreground">Limitar quantidade de escolhas</span>
                          </label>

                          {editingStep.maxSelectionsEnabled && (
                            <div>
                              <label className="text-xs text-muted-foreground">Máximo de itens que podem ser selecionados</label>
                              <input
                                type="number"
                                value={editingStep.maxSelections || 3}
                                onChange={(e) => setEditingStep({
                                  ...editingStep,
                                  maxSelections: parseInt(e.target.value) || 1
                                })}
                                className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm mt-1"
                                min="1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Cliente poderá selecionar no máximo {editingStep.maxSelections || 3} item(s)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingStep(null)}
                  className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-medium hover:bg-muted/80 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveStep}
                  className="flex-1 py-2 rounded-lg bg-brand-pink text-primary-foreground font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(index, "down")}
                    disabled={index === localSteps.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{step.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted">
                      {STEP_TYPE_LABELS[step.type] || step.type}
                    </span>
                    {isBuiltInStep(step.id) && (
                      <span className="text-muted-foreground">(obrigatório)</span>
                    )}
                    {getConditionSummary(step) && (
                      <span className="flex items-center gap-1 text-brand-pink">
                        <Filter className="w-3 h-3" />
                        {getConditionSummary(step)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleEnabled(step)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    step.enabled
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setEditingStep(step)}
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {!isBuiltInStep(step.id) && (
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckoutStepsManager;
