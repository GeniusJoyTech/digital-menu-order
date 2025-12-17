import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MenuConfig } from "@/data/menuConfig";
import { MenuItem } from "@/data/menuData";
import { ConfigService } from "@/services/configService";

interface MenuContextType {
  config: MenuConfig;
  loading: boolean;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  updateExtra: (extra: { id: string; name: string; price: number; stock?: number }) => void;
  addExtra: (extra: { id: string; name: string; price: number; stock?: number }) => void;
  deleteExtra: (id: string) => void;
  updateDrinkOption: (drink: { id: string; name: string; price: number; stock?: number }) => void;
  addDrinkOption: (drink: { id: string; name: string; price: number; stock?: number }) => void;
  deleteDrinkOption: (id: string) => void;
  updateAcaiTurbine: (items: { name: string; stock?: number }[]) => void;
  addAcaiTurbineItem: (item: { name: string; stock?: number }) => void;
  removeAcaiTurbineItem: (index: number) => void;
  updateAcaiTurbineItem: (index: number, item: { name: string; stock?: number }) => void;
  updateCategories: (categories: { id: string; name: string; color: string }[]) => void;
  resetToDefault: () => void;
  refetch: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const emptyConfig: MenuConfig = {
  menuItems: [],
  extras: [],
  categories: [],
  drinkOptions: [],
  acaiTurbine: [],
};

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<MenuConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await ConfigService.getMenuConfig();
      setConfig(data);
    } catch (error) {
      console.error("Error loading menu config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async (newConfig: MenuConfig) => {
    setConfig(newConfig);
    try {
      await ConfigService.saveMenuConfig(newConfig);
    } catch (error) {
      console.error("Error saving menu config:", error);
    }
  };

  const updateMenuItem = (item: MenuItem) => {
    const newConfig = {
      ...config,
      menuItems: config.menuItems.map((i) => (i.id === item.id ? item : i)),
    };
    saveConfig(newConfig);
  };

  const addMenuItem = (item: MenuItem) => {
    const newConfig = {
      ...config,
      menuItems: [...config.menuItems, item],
    };
    saveConfig(newConfig);
  };

  const deleteMenuItem = (id: string) => {
    const newConfig = {
      ...config,
      menuItems: config.menuItems.filter((i) => i.id !== id),
    };
    saveConfig(newConfig);
  };

  const updateExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    const newConfig = {
      ...config,
      extras: config.extras.map((e) => (e.id === extra.id ? extra : e)),
    };
    saveConfig(newConfig);
  };

  const addExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    const newConfig = {
      ...config,
      extras: [...config.extras, extra],
    };
    saveConfig(newConfig);
  };

  const deleteExtra = (id: string) => {
    const newConfig = {
      ...config,
      extras: config.extras.filter((e) => e.id !== id),
    };
    saveConfig(newConfig);
  };

  const updateDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    const newConfig = {
      ...config,
      drinkOptions: config.drinkOptions.map((d) => (d.id === drink.id ? drink : d)),
    };
    saveConfig(newConfig);
  };

  const addDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    const newConfig = {
      ...config,
      drinkOptions: [...config.drinkOptions, drink],
    };
    saveConfig(newConfig);
  };

  const deleteDrinkOption = (id: string) => {
    const newConfig = {
      ...config,
      drinkOptions: config.drinkOptions.filter((d) => d.id !== id),
    };
    saveConfig(newConfig);
  };

  const updateAcaiTurbine = (items: { name: string; stock?: number }[]) => {
    const newConfig = {
      ...config,
      acaiTurbine: items,
    };
    saveConfig(newConfig);
  };

  const addAcaiTurbineItem = (item: { name: string; stock?: number }) => {
    const newConfig = {
      ...config,
      acaiTurbine: [...config.acaiTurbine, item],
    };
    saveConfig(newConfig);
  };

  const removeAcaiTurbineItem = (index: number) => {
    const newConfig = {
      ...config,
      acaiTurbine: config.acaiTurbine.filter((_, i) => i !== index),
    };
    saveConfig(newConfig);
  };

  const updateAcaiTurbineItem = (index: number, item: { name: string; stock?: number }) => {
    const newConfig = {
      ...config,
      acaiTurbine: config.acaiTurbine.map((i, idx) => (idx === index ? item : i)),
    };
    saveConfig(newConfig);
  };

  const updateCategories = (categories: { id: string; name: string; color: string }[]) => {
    const newConfig = {
      ...config,
      categories,
    };
    saveConfig(newConfig);
  };

  const resetToDefault = async () => {
    try {
      const defaultConfig = await ConfigService.resetMenuConfig();
      setConfig(defaultConfig);
    } catch (error) {
      console.error("Error resetting menu config:", error);
    }
  };

  const refetch = async () => {
    await loadConfig();
  };

  return (
    <MenuContext.Provider
      value={{
        config,
        loading,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        updateExtra,
        addExtra,
        deleteExtra,
        updateDrinkOption,
        addDrinkOption,
        deleteDrinkOption,
        updateAcaiTurbine,
        addAcaiTurbineItem,
        removeAcaiTurbineItem,
        updateAcaiTurbineItem,
        updateCategories,
        resetToDefault,
        refetch,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
