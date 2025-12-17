import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, ChevronUp, ChevronDown, Filter, DollarSign, RotateCcw, Ban, Package } from "lucide-react";
import { CheckoutStep, CheckoutStepOption, PricingRule, LinkedMenuItem } from "@/data/checkoutConfig";
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
    linkedMenuItems: [],
  });

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState("");
  const [newOptionTrackStock, setNewOptionTrackStock] = useState(false);
  const [editOptionTrackStock, setEditOptionTrackStock] = useState(false);

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

    const pending = takePendingStepExclusiveItem();
    const stepToSave = pending
      ? { ...editingStep, options: [...(editingStep.options || []), pending] }
      : editingStep;

    updateLocalStep(stepToSave);
    setEditingStep(null);
    toast.success("Etapa atualizada localmente. Clique em 'Salvar Configurações' para aplicar.");
  };

  const handleAddStep = () => {
    if (!newStep.title?.trim()) {
      toast.error("Digite um título para a etapa");
      return;
    }

    const id = `step-${Date.now()}`;
    const pending = takePendingStepExclusiveItem();
    const optionsWithPending = pending ? [...(newStep.options || []), pending] : (newStep.options || []);

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
      options: optionsWithPending,
      pricingRule: newStep.pricingRule,
      maxSelectionsEnabled: newStep.maxSelectionsEnabled,
      maxSelections: newStep.maxSelections,
      linkedMenuItems: newStep.linkedMenuItems || [],
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
      linkedMenuItems: [],
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
      trackStock: newOptionTrackStock,
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
    setNewOptionTrackStock(false);
  };

  const startEditingOption = (option: { id: string; name: string; price: number; trackStock?: boolean }) => {
    setEditingOptionId(option.id);
    setEditOptionName(option.name);
    setEditOptionPrice(option.price.toString());
    setEditOptionTrackStock(option.trackStock || false);
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
      trackStock: editOptionTrackStock,
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
    setEditOptionTrackStock(false);
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

  // Functions for linked menu items
  const toggleLinkedMenuItem = (step: CheckoutStep, itemId: string, isEditing: boolean) => {
    const currentLinked = step.linkedMenuItems || [];
    const existingIndex = currentLinked.findIndex(l => l.itemId === itemId);
    
    let newLinked: LinkedMenuItem[];
    if (existingIndex >= 0) {
      // Remove item
      newLinked = currentLinked.filter(l => l.itemId !== itemId);
    } else {
      // Add item with excludeFromStock = false by default (items are in stock by default)
      newLinked = [...currentLinked, { itemId, excludeFromStock: false }];
    }
    
    if (isEditing && editingStep) {
      setEditingStep({ ...step, linkedMenuItems: newLinked });
    } else if (!isEditing) {
      setNewStep({ ...newStep, linkedMenuItems: newLinked });
    } else {
      updateLocalStep({ ...step, linkedMenuItems: newLinked });
    }
  };

  const toggleExcludeFromStock = (step: CheckoutStep, itemId: string, isEditing: boolean) => {
    const currentLinked = step.linkedMenuItems || [];
    const newLinked = currentLinked.map(l => 
      l.itemId === itemId ? { ...l, excludeFromStock: !l.excludeFromStock } : l
    );
    
    if (isEditing && editingStep) {
      setEditingStep({ ...step, linkedMenuItems: newLinked });
    } else if (!isEditing) {
      setNewStep({ ...newStep, linkedMenuItems: newLinked });
    } else {
      updateLocalStep({ ...step, linkedMenuItems: newLinked });
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
            Itens
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
          <button
            onClick={() => {
              const updated = { ...currentStep, showCondition: "items_and_categories" as const };
              isEditing ? setEditingStep(updated) : updateLocalStep(updated);
            }}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "items_and_categories"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Itens + Categorias
          </button>
        </div>

        {(showCondition === "specific_items" || showCondition === "items_and_categories") && (
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

        {(showCondition === "specific_categories" || showCondition === "items_and_categories") && (
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
            Itens
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
          <button
            onClick={() => setNewStep({ ...newStep, showCondition: "items_and_categories" })}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-w-[80px]",
              showCondition === "items_and_categories"
                ? "bg-brand-pink text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Itens + Categorias
          </button>
        </div>

        {(showCondition === "specific_items" || showCondition === "items_and_categories") && (
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

        {(showCondition === "specific_categories" || showCondition === "items_and_categories") && (
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

  // State for step-exclusive items
  const [newStepItemName, setNewStepItemName] = useState("");
  const [newStepItemPrice, setNewStepItemPrice] = useState("");
  const [newStepItemTrackStock, setNewStepItemTrackStock] = useState(false);

  const takePendingStepExclusiveItem = (): CheckoutStepOption | null => {
    const name = newStepItemName.trim();
    if (!name) return null;

    const item: CheckoutStepOption = {
      id: `step-item-${Date.now()}`,
      name,
      price: parseFloat(newStepItemPrice) || 0,
      trackStock: newStepItemTrackStock,
    };

    setNewStepItemName("");
    setNewStepItemPrice("");
    setNewStepItemTrackStock(false);

    return item;
  };

  // State for editing step-exclusive items
  const [editingStepItemId, setEditingStepItemId] = useState<string | null>(null);
  const [editStepItemName, setEditStepItemName] = useState("");
  const [editStepItemPrice, setEditStepItemPrice] = useState("");
  const [editStepItemTrackStock, setEditStepItemTrackStock] = useState(false);

  const addStepExclusiveItem = (isEditing: boolean) => {
    if (!newStepItemName.trim()) {
      toast.error("Digite um nome para o item");
      return;
    }
    
    const newItem = {
      id: `step-item-${Date.now()}`,
      name: newStepItemName.trim(),
      price: parseFloat(newStepItemPrice) || 0,
      trackStock: newStepItemTrackStock,
    };
    
    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: [...(editingStep.options || []), newItem],
      });
    } else {
      setNewStep({
        ...newStep,
        options: [...(newStep.options || []), newItem],
      });
    }
    
    setNewStepItemName("");
    setNewStepItemPrice("");
    setNewStepItemTrackStock(false);
  };

  const removeStepExclusiveItem = (itemId: string, isEditing: boolean) => {
    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: editingStep.options.filter(o => o.id !== itemId),
      });
    } else {
      setNewStep({
        ...newStep,
        options: (newStep.options || []).filter(o => o.id !== itemId),
      });
    }
  };

  const startEditingStepItem = (option: { id: string; name: string; price: number; trackStock?: boolean }) => {
    setEditingStepItemId(option.id);
    setEditStepItemName(option.name);
    setEditStepItemPrice(option.price.toString());
    setEditStepItemTrackStock(option.trackStock || false);
  };

  const saveEditingStepItem = (isEditing: boolean) => {
    if (!editingStepItemId || !editStepItemName.trim()) {
      toast.error("Digite um nome para o item");
      return;
    }

    const updatedItem = {
      id: editingStepItemId,
      name: editStepItemName.trim(),
      price: parseFloat(editStepItemPrice) || 0,
      trackStock: editStepItemTrackStock,
    };

    if (isEditing && editingStep) {
      setEditingStep({
        ...editingStep,
        options: editingStep.options.map(o => 
          o.id === editingStepItemId ? { ...o, ...updatedItem } : o
        ),
      });
    } else {
      setNewStep({
        ...newStep,
        options: (newStep.options || []).map(o => 
          o.id === editingStepItemId ? { ...o, ...updatedItem } : o
        ),
      });
    }

    setEditingStepItemId(null);
    setEditStepItemName("");
    setEditStepItemPrice("");
    setEditStepItemTrackStock(false);
  };

  const cancelEditingStepItem = () => {
    setEditingStepItemId(null);
    setEditStepItemName("");
    setEditStepItemPrice("");
    setEditStepItemTrackStock(false);
  };

  // Render linked menu items selector for both new step and editing
  const renderLinkedMenuItemsSelector = (step: CheckoutStep | null, isEditing: boolean) => {
    const currentStep = isEditing && editingStep ? editingStep : step;
    const linkedItems = isEditing && editingStep 
      ? editingStep.linkedMenuItems 
      : !isEditing 
        ? newStep.linkedMenuItems 
        : currentStep?.linkedMenuItems;
    
    const stepOptions = isEditing && editingStep 
      ? editingStep.options 
      : !isEditing 
        ? newStep.options 
        : currentStep?.options;
    
    return (
      <div className="space-y-4">
        {/* Menu items section */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-pink" />
            <label className="text-sm font-medium text-foreground">Itens do cardápio vinculados</label>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione itens do cardápio para vincular a esta etapa.
          </p>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {menuItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-2">Nenhum item no cardápio</p>
            ) : (
              menuItems.map((item) => {
                const linkedItem = (linkedItems || []).find(l => l.itemId === item.id);
                const isLinked = !!linkedItem;
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      isLinked ? "bg-brand-pink/10 border border-brand-pink/30" : "hover:bg-background"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={() => {
                        if (isEditing && editingStep) {
                          toggleLinkedMenuItem(editingStep, item.id, true);
                        } else if (!isEditing) {
                          const currentLinked = newStep.linkedMenuItems || [];
                          const existingIndex = currentLinked.findIndex(l => l.itemId === item.id);
                          if (existingIndex >= 0) {
                            setNewStep({ ...newStep, linkedMenuItems: currentLinked.filter(l => l.itemId !== item.id) });
                          } else {
                            setNewStep({ ...newStep, linkedMenuItems: [...currentLinked, { itemId: item.id, excludeFromStock: false }] });
                          }
                        }
                      }}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground flex-1">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          
          {(linkedItems || []).length > 0 && (
            <p className="text-xs text-brand-pink">
              {(linkedItems || []).length} item(s) vinculado(s)
            </p>
          )}
        </div>

        {/* Step-exclusive items section */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-pink" />
            <label className="text-sm font-medium text-foreground">Itens exclusivos da etapa</label>
          </div>
          <p className="text-xs text-muted-foreground">
            Adicione itens que existem apenas nesta etapa (não estão no cardápio).
          </p>
          
          {/* Existing step items */}
          {(stepOptions || []).length > 0 && (
            <div className="space-y-2">
              {(stepOptions || []).map((option) => (
                <div key={option.id} className="p-2 rounded-lg bg-background">
                  {editingStepItemId === option.id ? (
                    // Editing mode
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editStepItemName}
                          onChange={(e) => setEditStepItemName(e.target.value)}
                          placeholder="Nome do item"
                          className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        />
                        <input
                          type="number"
                          value={editStepItemPrice}
                          onChange={(e) => setEditStepItemPrice(e.target.value)}
                          placeholder="R$ 0,00"
                          className="w-24 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editStepItemTrackStock}
                            onChange={(e) => setEditStepItemTrackStock(e.target.checked)}
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">Item de estoque</span>
                        </label>
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEditingStepItem(isEditing)}
                            className="p-1 rounded bg-brand-pink text-primary-foreground hover:opacity-90"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEditingStepItem}
                            className="p-1 rounded bg-muted text-muted-foreground hover:bg-muted/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{option.name}</span>
                        {option.trackStock && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-pink/20 text-brand-pink">Estoque</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {option.price > 0 && (
                          <span className="text-xs text-brand-pink">
                            +R$ {option.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                        <button
                          onClick={() => startEditingStepItem(option)}
                          className="p-1 rounded text-muted-foreground hover:bg-muted/80"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeStepExclusiveItem(option.id, isEditing)}
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
          
          {/* Add new step item form */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={newStepItemName}
                onChange={(e) => setNewStepItemName(e.target.value)}
                placeholder="Nome do item"
                className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
              <input
                type="number"
                value={newStepItemPrice}
                onChange={(e) => setNewStepItemPrice(e.target.value)}
                placeholder="R$ 0,00"
                className="w-24 p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                min="0"
                step="0.01"
              />
              <button
                onClick={() => addStepExclusiveItem(isEditing)}
                className="p-2 rounded-lg bg-brand-pink text-primary-foreground hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newStepItemTrackStock}
                onChange={(e) => setNewStepItemTrackStock(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-xs text-muted-foreground">Item de estoque (aparece na aba Estoque)</span>
            </label>
          </div>
          
          {(stepOptions || []).length > 0 && (
            <p className="text-xs text-brand-pink">
              {(stepOptions || []).length} item(s) exclusivo(s)
            </p>
          )}
        </div>
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
    if (condition === "items_and_categories") {
      const items = (step.triggerItemIds || []).length;
      const cats = (step.triggerCategoryIds || []).length;
      return `${items} item(s), ${cats} cat(s)`;
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

          {/* Linked menu items */}
          {renderLinkedMenuItemsSelector(null, false)}

          {/* Pricing Rules - only for multiSelect */}
          {newStep.multiSelect && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
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
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
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

                  {/* Linked menu items */}
                  {renderLinkedMenuItemsSelector(editingStep, true)}

                  {/* Pricing Rules when editing */}
                  {editingStep.multiSelect && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
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
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
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
