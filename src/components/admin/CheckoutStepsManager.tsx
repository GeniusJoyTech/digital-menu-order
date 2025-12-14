import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { CheckoutStep } from "@/data/checkoutConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckoutStepsManagerProps {
  steps: CheckoutStep[];
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

  const isBuiltInStep = (id: string) => id === "delivery" || id === "name";
  const isDataStep = (id: string) => id === "turbinar-shake" || id === "bebida-extra";

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          Configure as etapas que aparecem antes do envio do pedido. Você pode renomear, 
          habilitar/desabilitar, reordenar e adicionar novas etapas.
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted">
                    {STEP_TYPE_LABELS[step.type] || step.type}
                  </span>
                  {isDataStep(step.id) && (
                    <span className="text-brand-pink">
                      (usa dados do cardápio)
                    </span>
                  )}
                  {isBuiltInStep(step.id) && (
                    <span className="text-muted-foreground">(obrigatório)</span>
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
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckoutStepsManager;
