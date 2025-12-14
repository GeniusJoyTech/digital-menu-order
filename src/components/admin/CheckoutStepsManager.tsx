import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { CheckoutStep } from "@/data/checkoutConfig";
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
}

const STEP_TYPE_LABELS: Record<string, string> = {
  delivery: "Tipo de entrega",
  name: "Nome do cliente",
  extras: "Extras (Turbinar)",
  drinks: "Bebidas",
  custom_select: "Seleção personalizada",
  custom_text: "Campo de texto",
};

export const CheckoutStepsManager = ({
  steps,
  menuItems,
  categories,
  onUpdate,
  onAdd,
  onDelete,
  onReorder,
}: CheckoutStepsManagerProps) => {
  const [editingStep, setEditingStep] = useState<CheckoutStep | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
  });

  const handleSaveStep = () => {
    if (!editingStep) return;
    onUpdate(editingStep);
    setEditingStep(null);
    toast.success("Etapa atualizada!");
  };

  const handleAddStep = () => {
    if (!newStep.title?.trim()) {
      toast.error("Digite um título para a etapa");
      return;
    }

    const id = `step-${Date.now()}`;
    onAdd({
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
      options: [],
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
    });
    setShowAddForm(false);
    toast.success("Etapa adicionada!");
  };

  const handleDeleteStep = (id: string) => {
    if (id === "delivery" || id === "name") {
      toast.error("Esta etapa é obrigatória e não pode ser removida");
      return;
    }
    if (confirm("Tem certeza que deseja remover esta etapa?")) {
      onDelete(id);
      toast.success("Etapa removida!");
    }
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    onReorder(newSteps);
  };

  const toggleEnabled = (step: CheckoutStep) => {
    onUpdate({ ...step, enabled: !step.enabled });
    toast.success(step.enabled ? "Etapa desabilitada" : "Etapa habilitada");
  };

  const toggleItemInTriggerList = (step: CheckoutStep, itemId: string) => {
    const currentIds = step.triggerItemIds || [];
    const newIds = currentIds.includes(itemId)
      ? currentIds.filter(id => id !== itemId)
      : [...currentIds, itemId];
    
    if (step === editingStep) {
      setEditingStep({ ...step, triggerItemIds: newIds });
    } else {
      onUpdate({ ...step, triggerItemIds: newIds });
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
      onUpdate({ ...step, triggerCategoryIds: newIds });
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
              isEditing ? setEditingStep(updated) : onUpdate(updated);
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
              isEditing ? setEditingStep(updated) : onUpdate(updated);
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
              isEditing ? setEditingStep(updated) : onUpdate(updated);
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
      {steps.map((step, index) => (
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
                    disabled={index === steps.length - 1}
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
