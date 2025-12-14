import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MenuConfig, loadMenuConfig, saveMenuConfig, resetMenuConfig } from "@/data/menuConfig";
import { MenuItem } from "@/data/menuData";

interface MenuContextType {
  config: MenuConfig;
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
  resetToDefault: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<MenuConfig>(loadMenuConfig);

  useEffect(() => {
    saveMenuConfig(config);
  }, [config]);

  const updateMenuItem = (item: MenuItem) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((i) => (i.id === item.id ? item : i)),
    }));
  };

  const addMenuItem = (item: MenuItem) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, item],
    }));
  };

  const deleteMenuItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((i) => i.id !== id),
    }));
  };

  const updateExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      extras: prev.extras.map((e) => (e.id === extra.id ? extra : e)),
    }));
  };

  const addExtra = (extra: { id: string; name: string; price: number; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      extras: [...prev.extras, extra],
    }));
  };

  const deleteExtra = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      extras: prev.extras.filter((e) => e.id !== id),
    }));
  };

  const updateDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      drinkOptions: prev.drinkOptions.map((d) => (d.id === drink.id ? drink : d)),
    }));
  };

  const addDrinkOption = (drink: { id: string; name: string; price: number; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      drinkOptions: [...prev.drinkOptions, drink],
    }));
  };

  const deleteDrinkOption = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      drinkOptions: prev.drinkOptions.filter((d) => d.id !== id),
    }));
  };

  const updateAcaiTurbine = (items: { name: string; stock?: number }[]) => {
    setConfig((prev) => ({
      ...prev,
      acaiTurbine: items,
    }));
  };

  const addAcaiTurbineItem = (item: { name: string; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      acaiTurbine: [...prev.acaiTurbine, item],
    }));
  };

  const removeAcaiTurbineItem = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      acaiTurbine: prev.acaiTurbine.filter((_, i) => i !== index),
    }));
  };

  const updateAcaiTurbineItem = (index: number, item: { name: string; stock?: number }) => {
    setConfig((prev) => ({
      ...prev,
      acaiTurbine: prev.acaiTurbine.map((i, idx) => (idx === index ? item : i)),
    }));
  };

  const resetToDefault = () => {
    const defaultConfig = resetMenuConfig();
    setConfig(defaultConfig);
  };

  return (
    <MenuContext.Provider
      value={{
        config,
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
        resetToDefault,
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
