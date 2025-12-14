import { MenuItem, menuItems as defaultMenuItems, extras as defaultExtras, menuCategories as defaultCategories } from "./menuData";

const STORAGE_KEY = "shakeyes_menu_config";

export interface MenuConfig {
  menuItems: MenuItem[];
  extras: { id: string; name: string; price: number; stock?: number }[];
  categories: { id: string; name: string; color: string }[];
  drinkOptions: { id: string; name: string; price: number; stock?: number }[];
  acaiTurbine: { name: string; stock?: number }[];
}

const defaultDrinkOptions = [
  { id: "none", name: "Não, obrigado", price: 0 },
  { id: "agua", name: "Água", price: 5 },
  { id: "coca-lata", name: "Coca-Cola Lata", price: 7 },
  { id: "guarana-lata", name: "Guaraná Lata", price: 7 },
];

const defaultAcaiTurbine = [
  { name: "Leite em pó" },
  { name: "Leite ninho" },
  { name: "Paçoca" },
  { name: "Granola" },
  { name: "Ovomaltine" },
  { name: "Nutella" },
  { name: "Bis" },
  { name: "Frutas" }
];

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
