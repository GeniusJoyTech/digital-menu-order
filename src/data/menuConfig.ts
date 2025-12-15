import { MenuItem, menuItems as defaultMenuItems, extras as defaultExtras, menuCategories as defaultCategories } from "./menuData";

const STORAGE_KEY = "shakeyes_menu_config";

export interface MenuConfig {
  menuItems: MenuItem[];
  extras: { id: string; name: string; price: number; stock?: number }[];
  categories: { id: string; name: string; color: string }[];
  drinkOptions: { id: string; name: string; price: number; stock?: number }[];
  acaiTurbine: { name: string; stock?: number }[];
}

const defaultDrinkOptions: { id: string; name: string; price: number; stock?: number }[] = [];

const defaultAcaiTurbine: { name: string; stock?: number }[] = [];

const getDefaultConfig = (): MenuConfig => ({
  menuItems: defaultMenuItems,
  extras: defaultExtras,
  categories: defaultCategories,
  drinkOptions: defaultDrinkOptions,
  acaiTurbine: defaultAcaiTurbine,
});

export const loadMenuConfig = (): MenuConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultConfig(),
        ...parsed,
      };
    }
  } catch (error) {
    console.error("Error loading menu config:", error);
  }
  return getDefaultConfig();
};

export const saveMenuConfig = (config: MenuConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving menu config:", error);
  }
};

export const resetMenuConfig = (): MenuConfig => {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultConfig();
};
