import { pgTable, text, serial, jsonb, timestamp, numeric, varchar } from "drizzle-orm/pg-core";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  itemId: varchar("item_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  prices: jsonb("prices").notNull().$type<{ size: string; price: number }[]>(),
  category: varchar("category", { length: 255 }).notNull(),
  image: text("image").notNull().default(""),
  stock: numeric("stock"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  categoryId: varchar("category_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
});

export const extras = pgTable("extras", {
  id: serial("id").primaryKey(),
  extraId: varchar("extra_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: numeric("stock"),
});

export const drinkOptions = pgTable("drink_options", {
  id: serial("id").primaryKey(),
  drinkId: varchar("drink_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: numeric("stock"),
});

export const acaiTurbine = pgTable("acai_turbine", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stock: numeric("stock"),
});

export const checkoutSteps = pgTable("checkout_steps", {
  id: serial("id").primaryKey(),
  stepId: varchar("step_id", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  enabled: jsonb("enabled").notNull().$type<boolean>().default(true),
  required: jsonb("required").notNull().$type<boolean>().default(false),
  multiSelect: jsonb("multi_select").notNull().$type<boolean>().default(false),
  options: jsonb("options").notNull().$type<{ id: string; name: string; price: number; stock?: number; trackStock?: boolean }[]>().default([]),
  showForTable: jsonb("show_for_table").notNull().$type<boolean>().default(true),
  skipForPickup: jsonb("skip_for_pickup").$type<boolean>(),
  showCondition: varchar("show_condition", { length: 50 }).notNull().default("always"),
  triggerItemIds: jsonb("trigger_item_ids").$type<string[]>(),
  triggerCategoryIds: jsonb("trigger_category_ids").$type<string[]>(),
  pricingRule: jsonb("pricing_rule").$type<{
    enabled: boolean;
    freeItemsLimit: number;
    ruleType: string;
    pricePerItem: number;
    flatPrice: number;
  }>(),
  maxSelectionsEnabled: jsonb("max_selections_enabled").$type<boolean>(),
  maxSelections: numeric("max_selections"),
  sortOrder: numeric("sort_order").notNull().default("0"),
});

export const designConfig = pgTable("design_config", {
  id: serial("id").primaryKey(),
  storeName: varchar("store_name", { length: 255 }).notNull().default("MilkShakes"),
  storeDescription: text("store_description").notNull().default("Os melhores milkshakes da cidade"),
  storeLogo: text("store_logo").notNull().default(""),
  socialLinks: jsonb("social_links").notNull().$type<{ platform: string; url: string; icon: string }[]>().default([]),
  colors: jsonb("colors").notNull().$type<{
    primary: string;
    background: string;
    card: string;
    accent: string;
    border: string;
    text: string;
    heading: string;
    muted: string;
  }>(),
  fonts: jsonb("fonts").notNull().$type<{
    display: string;
    body: string;
    price: string;
    button: string;
    nav: string;
  }>(),
  customFonts: jsonb("custom_fonts").notNull().$type<{ name: string; url: string }[]>().default([]),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull().default(""),
  deliveryType: varchar("delivery_type", { length: 20 }).notNull(),
  tableNumber: varchar("table_number", { length: 50 }),
  address: text("address"),
  items: jsonb("items").notNull().$type<{ name: string; size: string; quantity: number; price: number }[]>(),
  extras: jsonb("extras").notNull().$type<{ name: string; price: number }[]>().default([]),
  drink: jsonb("drink").$type<{ name: string; price: number } | null>(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Extra = typeof extras.$inferSelect;
export type InsertExtra = typeof extras.$inferInsert;
export type DrinkOption = typeof drinkOptions.$inferSelect;
export type InsertDrinkOption = typeof drinkOptions.$inferInsert;
export type AcaiTurbineItem = typeof acaiTurbine.$inferSelect;
export type InsertAcaiTurbineItem = typeof acaiTurbine.$inferInsert;
export type CheckoutStep = typeof checkoutSteps.$inferSelect;
export type InsertCheckoutStep = typeof checkoutSteps.$inferInsert;
export type DesignConfig = typeof designConfig.$inferSelect;
export type InsertDesignConfig = typeof designConfig.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
