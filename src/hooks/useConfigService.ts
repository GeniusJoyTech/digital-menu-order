import { useState, useCallback } from "react";
import { ConfigService, DesignConfig, defaultDesignConfig } from "@/services/configService";
import { toast } from "sonner";

/**
 * Hook for managing configuration export/import
 */
export const useConfigExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportConfig = useCallback(async () => {
    setIsExporting(true);
    try {
      const json = await ConfigService.exportAllConfig();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `config-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Configuração exportada com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar configuração");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importConfig = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      await ConfigService.importAllConfig(text);
      toast.success("Configuração importada! Recarregue a página para ver as alterações.");
      // Reload after short delay to apply changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro ao importar configuração. Verifique se o arquivo é válido.");
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    exportConfig,
    importConfig,
    isExporting,
    isImporting,
  };
};

/**
 * Hook for managing design configuration
 */
export const useDesignConfig = () => {
  const [config, setConfig] = useState<DesignConfig>(defaultDesignConfig);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await ConfigService.getDesignConfig();
      setConfig(loaded);
    } catch (error) {
      console.error("Error loading design config:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: DesignConfig) => {
    try {
      await ConfigService.saveDesignConfig(newConfig);
      setConfig(newConfig);
      toast.success("Design salvo com sucesso!");
    } catch (error) {
      console.error("Error saving design config:", error);
      toast.error("Erro ao salvar design");
    }
  }, []);

  const resetConfig = useCallback(async () => {
    try {
      const defaultConfig = await ConfigService.resetDesignConfig();
      setConfig(defaultConfig);
      toast.success("Design restaurado para o padrão!");
    } catch (error) {
      console.error("Error resetting design config:", error);
      toast.error("Erro ao restaurar design");
    }
  }, []);

  return {
    config,
    isLoading,
    loadConfig,
    saveConfig,
    resetConfig,
  };
};

/**
 * Hook for image upload
 */
export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await ConfigService.uploadImage(file);
      toast.success("Imagem carregada!");
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar imagem");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadImage,
    isUploading,
  };
};
