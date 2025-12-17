import { MenuItem, menuItems as defaultMenuItems, extras as defaultExtras, menuCategories as defaultCategories } from "./menuData";

export interface MenuConfig {
  menuItems: MenuItem[];
  extras: { id: string; name: string; price: number; stock?: number }[];
  categories: { id: string; name: string; color: string }[];
  drinkOptions: { id: string; name: string; price: number; stock?: number }[];
  acaiTurbine: { name: string; stock?: number }[];
}

const defaultDrinkOptions: { id: string; name: string; price: number; stock?: number }[] = [];

const defaultAcaiTurbine: { name: string; stock?: number }[] = [];

export const getDefaultConfig = (): MenuConfig => ({
  menuItems: defaultMenuItems,
  extras: defaultExtras,
  categories: defaultCategories,
  drinkOptions: defaultDrinkOptions,
  acaiTurbine: defaultAcaiTurbine,
});

export const loadMenuConfig = (): MenuConfig => {
  return getDefaultConfig();
};

export const saveMenuConfig = (config: MenuConfig): void => {
  console.log("Menu config saved to API");
};

export const resetMenuConfig = (): MenuConfig => {
  return getDefaultConfig();
};
