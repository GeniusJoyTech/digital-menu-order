import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Save, X, Upload, Image, Package, Palette, Type, RotateCcw, Layers, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DesignConfig, CardLayout, CustomFont, SocialLink } from "@/contexts/DesignContext";
import { ColorPicker } from "./ColorPicker";
import { UserSettings } from "./UserSettings";

const LAYOUT_OPTIONS: { value: CardLayout; label: string; description: string }[] = [
  { value: "left-filled", label: "Imagem à esquerda (Preenchido)", description: "Card com fundo colorido e imagem à esquerda" },
  { value: "right-filled", label: "Imagem à direita (Preenchido)", description: "Card com fundo colorido e imagem à direita" },
  { value: "left-bordered", label: "Imagem à esquerda (Bordas)", description: "Card com borda e imagem à esquerda" },
  { value: "right-bordered", label: "Imagem à direita (Bordas)", description: "Card com borda e imagem à direita" },
  { value: "left", label: "Imagem à esquerda (Simples)", description: "Card simples com imagem à esquerda" },
  { value: "right", label: "Imagem à direita (Simples)", description: "Card simples com imagem à direita" },
];

interface DesignManagerProps {
  design: DesignConfig;
  onSave: (design: DesignConfig) => void;
  onReset: () => void;
  onAddCustomFont: (font: CustomFont) => void;
  onRemoveCustomFont: (fontName: string) => void;
  getAllFonts: () => string[];
  onGoToCategories: () => void;
}

export const DesignManager = ({
  design,
  onSave,
  onReset,
  onAddCustomFont,
  onRemoveCustomFont,
  getAllFonts,
  onGoToCategories,
}: DesignManagerProps) => {
  const [localDesign, setLocalDesign] = useState<DesignConfig>(design);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [newFontName, setNewFontName] = useState("");
  const [newFontUrl, setNewFontUrl] = useState("");

  useEffect(() => {
    setLocalDesign(design);
    setHasUnsavedChanges(false);
  }, [design]);

  const updateLocalDesign = (updates: Partial<DesignConfig>) => {
    setLocalDesign((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave(localDesign);
    setHasUnsavedChanges(false);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleDiscard = () => {
    setLocalDesign(design);
    setHasUnsavedChanges(false);
    toast.info("Alterações descartadas");
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja restaurar todas as configurações de design para o padrão inicial?")) {
      onReset();
      toast.success("Design restaurado para o padrão!");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLocalDesign({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFont = () => {
    if (newFontName.trim() && newFontUrl.trim()) {
      onAddCustomFont({ name: newFontName.trim(), url: newFontUrl.trim() });
      setNewFontName("");
      setNewFontUrl("");
      toast.success(`Fonte "${newFontName}" adicionada!`);
    } else {
      toast.error("Preencha o nome e URL da fonte");
    }
  };

  return (
    <div className="space-y-6">
      {/* User Settings */}
      <UserSettings />
      {hasUnsavedChanges && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <span className="text-sm text-amber-600 font-medium">
            Você tem alterações não salvas
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-brand-pink text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Logo Section */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-foreground">Logo da Loja</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
            {localDesign.logo ? (
              <img src={localDesign.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Image className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
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
            {localDesign.logo && (
              <button
                onClick={() => updateLocalDesign({ logo: "" })}
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
            value={localDesign.storeName}
            onChange={(e) => updateLocalDesign({ storeName: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Descrição</label>
          <input
            type="text"
            value={localDesign.storeDescription || ""}
            onChange={(e) => updateLocalDesign({ storeDescription: e.target.value })}
            placeholder="Ex: Personalizamos o copo com o seu nome!"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
          />
        </div>

        {/* Social Links */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Redes Sociais</h4>
          <div className="space-y-3">
            {(localDesign.socialLinks || []).map((social, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={social.platform}
                  onChange={(e) => {
                    const newLinks = [...(localDesign.socialLinks || [])];
                    newLinks[index] = { ...social, platform: e.target.value };
                    updateLocalDesign({ socialLinks: newLinks });
                  }}
                  placeholder="Nome (ex: Instagram)"
                  className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={social.url}
                  onChange={(e) => {
                    const newLinks = [...(localDesign.socialLinks || [])];
                    newLinks[index] = { ...social, url: e.target.value };
                    updateLocalDesign({ socialLinks: newLinks });
                  }}
                  placeholder="Link (ex: https://instagram.com/...)"
                  className="flex-[2] p-3 rounded-xl border border-border bg-background text-foreground"
                />
                <button
                  onClick={() => {
                    const newLinks = (localDesign.socialLinks || []).filter((_, i) => i !== index);
                    updateLocalDesign({ socialLinks: newLinks });
                  }}
                  className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(localDesign.socialLinks || []), { platform: "", url: "", icon: "" }];
                updateLocalDesign({ socialLinks: newLinks });
              }}
              className="w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Rede Social
            </button>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-foreground">Cores do Layout</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Cor Principal (Header)"
            hslValue={localDesign.primaryColor}
            onChange={(value) => updateLocalDesign({ primaryColor: value })}
          />
          
          <ColorPicker
            label="Cor de Fundo"
            hslValue={localDesign.backgroundColor}
            onChange={(value) => updateLocalDesign({ backgroundColor: value })}
          />
          
          <ColorPicker
            label="Cor do Card"
            hslValue={localDesign.cardBackground}
            onChange={(value) => updateLocalDesign({ cardBackground: value })}
          />
          
          <ColorPicker
            label="Cor de Destaque"
            hslValue={localDesign.accentColor}
            onChange={(value) => updateLocalDesign({ accentColor: value })}
          />

          <ColorPicker
            label="Cor das Bordas"
            hslValue={localDesign.borderColor || "340 30% 80%"}
            onChange={(value) => updateLocalDesign({ borderColor: value })}
          />

          <ColorPicker
            label="Cor do Texto Principal"
            hslValue={localDesign.textColor || "340 30% 20%"}
            onChange={(value) => updateLocalDesign({ textColor: value })}
          />

          <ColorPicker
            label="Cor dos Títulos"
            hslValue={localDesign.headingColor || "340 40% 25%"}
            onChange={(value) => updateLocalDesign({ headingColor: value })}
          />

          <ColorPicker
            label="Cor do Texto Secundário"
            hslValue={localDesign.mutedTextColor || "340 20% 50%"}
            onChange={(value) => updateLocalDesign({ mutedTextColor: value })}
          />
        </div>
      </div>

      {/* Category Colors Section */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-foreground">Cores das Categorias</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Para editar as cores de fundo dos itens do cardápio, acesse a aba "Categorias" e edite a cor de cada categoria individualmente.
        </p>
        <button
          onClick={onGoToCategories}
          className="w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Ir para Categorias
        </button>
      </div>

      {/* Fonts Section */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-foreground">Fontes</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Fonte de Títulos</label>
            <select
              value={localDesign.fontDisplay}
              onChange={(e) => updateLocalDesign({ fontDisplay: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {getAllFonts().map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Fonte do Corpo</label>
            <select
              value={localDesign.fontBody}
              onChange={(e) => updateLocalDesign({ fontBody: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {getAllFonts().map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fonte dos Preços</label>
            <select
              value={localDesign.fontPrice || localDesign.fontBody}
              onChange={(e) => updateLocalDesign({ fontPrice: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {getAllFonts().map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fonte dos Botões</label>
            <select
              value={localDesign.fontButton || localDesign.fontBody}
              onChange={(e) => updateLocalDesign({ fontButton: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {getAllFonts().map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fonte da Navegação</label>
            <select
              value={localDesign.fontNav || localDesign.fontBody}
              onChange={(e) => updateLocalDesign({ fontNav: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
            >
              {getAllFonts().map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Custom Font */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Adicionar Fonte do Google</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Nome da Fonte</label>
              <input
                type="text"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                placeholder="Ex: Momo Signature"
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">URL do Google Fonts</label>
              <input
                type="text"
                value={newFontUrl}
                onChange={(e) => setNewFontUrl(e.target.value)}
                placeholder="https://fonts.googleapis.com/css2?family=..."
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground mt-1"
              />
            </div>
            <button
              onClick={handleAddFont}
              className="w-full py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Fonte
            </button>
          </div>
        </div>

        {/* Custom Fonts List */}
        {design.customFonts.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Fontes Personalizadas</h4>
            <div className="space-y-2">
              {design.customFonts.map((font) => (
                <div
                  key={font.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted"
                >
                  <span className="font-medium text-foreground" style={{ fontFamily: font.name }}>
                    {font.name}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Remover a fonte "${font.name}"?`)) {
                        onRemoveCustomFont(font.name);
                        toast.success(`Fonte "${font.name}" removida!`);
                      }
                    }}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
              onClick={() => updateLocalDesign({ cardLayout: layout.value })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                localDesign.cardLayout === layout.value
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDiscard}
          disabled={!hasUnsavedChanges}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2",
            hasUnsavedChanges
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          )}
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2",
            hasUnsavedChanges
              ? "bg-brand-pink text-primary-foreground hover:opacity-90"
              : "bg-brand-pink/50 text-primary-foreground/50 cursor-not-allowed"
          )}
        >
          <Save className="w-5 h-5" />
          Salvar
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Restaurar Padrão
      </button>
    </div>
  );
};

export default DesignManager;
